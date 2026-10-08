import express from 'express';
import crypto from 'node:crypto';
import { getServers, setServers } from 'node:dns';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { buildIntents } from './intents.js';

// Load api/.env even when Node is started from the React project folder.
const envPath = fileURLToPath(new URL('./.env', import.meta.url));
if (existsSync(envPath)) loadEnvFile(envPath);

// mongodb+srv relies on DNS SRV lookups. Some Windows/VPN setups expose only
// a localhost DNS stub to Node (127.0.0.1/::1), which rejects those queries.
// DNS_SERVERS can override the fallback, for example: 1.1.1.1,8.8.8.8.
const configuredDnsServers = (process.env.DNS_SERVERS || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const currentDnsServers = getServers();
const usesOnlyLoopbackDns = currentDnsServers.length > 0 && currentDnsServers.every(server =>
  server === '::1' || server === '[::1]' || server.startsWith('127.')
);
if (configuredDnsServers.length || usesOnlyLoopbackDns) {
  setServers(configuredDnsServers.length ? configuredDnsServers : ['1.1.1.1', '8.8.8.8']);
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false }));
// Send CORS headers before any API response, including 422/503 errors.
app.use('/api/payment', (req, res, next) => {
  const configured = (process.env.CLIENT_ORIGIN || '')
    .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  const allowed = new Set(['http://localhost:3000', 'http://127.0.0.1:3000', ...configured]);
  const origin = req.get('Origin');
  if (origin && allowed.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Token');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
const PORT = Number(process.env.PORT || 3001);
const COLLECTION = process.env.MONGODB_COLLECTION || 'payments';
let client;
let db;
async function payments() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) throw new Error('MongoDB not configured');
  if (!client) client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGODB_DB);
    await db.collection(COLLECTION).createIndex({ txn_ref: 1 }, { unique: true });
  }
  return db.collection(COLLECTION);
}
const refValid = ref => /^TXN\d{10,}$/.test(ref);
function amountString(v) { return Number(v).toFixed(2); }
function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
async function poolPayee() {
  if (!process.env.POOL_CREATE_URL || !process.env.POOL_API_KEY) return null;
  const response = await fetch(process.env.POOL_CREATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.POOL_API_KEY },
    body: '{}',
    signal: AbortSignal.timeout(7000),
  });
  const data = await response.json();
  if (!data?.ok || !data?.payee?.upiId) return null;
  return data.payee;
}

app.post('/api/payment/initiate', async (req, res) => {
  const amount = Number(req.body?.amount);
  let payType = String(req.body?.pay_type || 'upi').toLowerCase().replace(/[^a-z_]/g, '').slice(0, 50) || 'upi';
  if (!Number.isFinite(amount) || amount <= 0) return res.status(422).json({ ok: false, error: 'invalid_amount' });
  try {
    let payee = null;
    try { payee = await poolPayee(); } catch (error) { console.error('Pool unavailable:', error); }
    const upiId = payee?.upiId || process.env.FALLBACK_UPI_ID || '';
    if (!/^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+$/.test(upiId)) {
      return res.status(503).json({ ok: false, error: 'upi_unavailable' });
    }
    const merchantName = payee?.name || process.env.FALLBACK_MERCHANT_NAME || 'Verified Seller';
    const paytmMid = payee?.merchantId || '';
    const orderNumber = String(Date.now() * 1000 + crypto.randomInt(0, 1000));
    const txnRef = 'TXN' + orderNumber;
    const col = await payments();
    await col.insertOne({
      order_number: orderNumber, txn_ref: txnRef, pay_type: payType,
      upi_address: upiId, amount, merchant_name: merchantName, paytm_mid: paytmMid,
      payment_status: 'pending', utr: '', payer_vpa: '', payer_name: '',
      paytm_txn_id: '', response_message: '', source: payee ? 'pool' : 'env',
      created_at: new Date(), updated_at: null,
    });
    return res.json({
      ok: true, orderNumber, txnRef, upiId, merchantName,
      amount: amountString(amount), source: payee ? 'pool' : 'env', stored: true,
      ...buildIntents(amount, txnRef, upiId, merchantName),
    });
  } catch (error) {
    console.error('Payment initiation failed:', error);
    return res.status(503).json({ ok: false, error: 'payment_unavailable' });
  }
});

app.post('/api/payment/check', async (req, res) => {
  const ref = String(req.body?.txnRef || '').trim();
  if (!refValid(ref)) return res.status(422).json({ ok: false, error: 'invalid_ref' });
  try {
    const col = await payments();
    const row = await col.findOne({ txn_ref: ref });
    if (!row) return res.json({ ok: true, status: 'pending' });
    if (row.payment_status === 'success' || row.payment_status === 'failure') {
      return res.json({ ok: true, status: row.payment_status, utr: row.utr || '', amount: amountString(row.amount), source: 'db' });
    }
    if (row.paytm_mid) {
      try {
        const data = encodeURIComponent(JSON.stringify({ MID: row.paytm_mid, ORDERID: ref }));
        const response = await fetch('https://securegw.paytm.in/order/status?JsonData=' + data, { signal: AbortSignal.timeout(6000) });
        const p = await response.json();
        if (p.STATUS === 'TXN_SUCCESS' && String(p.MID) === row.paytm_mid && String(p.ORDERID) === ref) {
          const utr = String(p.BANKTXNID || '');
          await col.updateOne({ txn_ref: ref, payment_status: 'pending' }, { $set: {
            payment_status: 'success', utr, paytm_txn_id: String(p.TXNID || ''),
            response_message: 'paytm_status_api gateway=' + String(p.GATEWAYNAME || ''), updated_at: new Date(),
          }});
          return res.json({ ok: true, status: 'success', utr, amount: String(p.TXNAMOUNT || ''), source: 'paytm_api' });
        }
        if (p.STATUS === 'TXN_FAILURE' || p.STATUS === 'FAILED') {
          const msg = String(p.RESPMSG || '');
          const notPaidYet = msg.includes('Invalid Order Id') || msg.includes('No record found') || msg.includes('PENDING') || !p.TXNID;
          if (!notPaidYet) {
            await col.updateOne({ txn_ref: ref, payment_status: 'pending' }, { $set: {
              payment_status: 'failure', response_message: 'paytm_status_api ' + msg.slice(0, 180), updated_at: new Date(),
            }});
            return res.json({ ok: true, status: 'failure', source: 'paytm_api' });
          }
        }
      } catch (error) { console.error('Paytm status unavailable:', error); }
    }
    return res.json({ ok: true, status: 'pending' });
  } catch (error) {
    console.error('Payment check failed:', error);
    return res.status(503).json({ ok: false, error: 'db_unavailable' });
  }
});

app.get('/api/payment/health', (_req, res) => res.json({
  ok: true, service: 'payment-api', version: 'cors-env-2',
  mongoConfigured: Boolean(process.env.MONGODB_URI && process.env.MONGODB_DB),
  poolConfigured: Boolean(process.env.POOL_CREATE_URL && process.env.POOL_API_KEY),
  fallbackUpiConfigured: Boolean(process.env.FALLBACK_UPI_ID),
}));
app.get('/api/payment/notification', (_req, res) => res.json({ ok: true, route: 'payment-notification' }));
app.post('/api/payment/notification', async (req, res) => {
  const token = req.get('X-Webhook-Token') || req.query.token || '';
  if (!process.env.PAYMENT_WEBHOOK_TOKEN || !safeEqual(token, process.env.PAYMENT_WEBHOOK_TOKEN)) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  const body = req.body || {};
  const ref = String(body.comment || body.note || body.orderId || body.txnid || '').trim();
  if (!refValid(ref)) return res.status(400).json({ ok: false, error: 'invalid or missing comment/orderId' });
  const status = String(body.status || 'success').toLowerCase().trim();
  const success = ['success', 'successful', 'txn_success'].includes(status);
  const failure = ['failure', 'failed', 'txn_failure'].includes(status);
  if (!success && !failure) return res.json({ ok: true, ignored: true, reason: 'non-terminal status' });
  try {
    const col = await payments();
    const matched = await col.updateOne({ txn_ref: ref, payment_status: 'pending' }, { $set: {
      payment_status: success ? 'success' : 'failure',
      utr: String(body.utr || body.UTR || body.bankRef || ''),
      payer_vpa: String(body.payerVpa || body.vpa || ''),
      payer_name: String(body.payerName || body.name || ''),
      paytm_txn_id: String(body.paytmTxnId || body.txnId || ''),
      response_message: 'pool_webhook amount=' + String(body.amount || body.txnAmount || '') + ' paytmTxnId=' + String(body.paytmTxnId || body.txnId || ''),
      updated_at: new Date(),
    }});
    return res.json({ ok: true, matched: matched.modifiedCount > 0, txn_ref: ref });
  } catch (error) {
    console.error('Payment notification failed:', error);
    return res.status(503).json({ ok: false, error: 'db unavailable' });
  }
});
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Payment API listening on ${PORT}`));
}

export default app;
