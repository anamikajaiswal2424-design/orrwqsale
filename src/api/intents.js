// Same field order and payload shape as verify/_intents.php.
const amt = n => String(Number(Number(n).toFixed(2)));
export function buildIntents(amount, ref, upiId, merchantName) {
  const am = amt(amount);
  const pn = encodeURIComponent(merchantName);
  const upiUrl = `upi://pay?pa=${upiId}&am=${am}&pn=${pn}&tn=${ref}&tr=${ref}&cu=INR`;
  const paytmIntent = `paytmmp://cash_wallet?pa=${upiId}&pn=${pn}&am=${am}&cu=INR&tn=${ref}&tr=${ref}&mc=4722&&sign=${process.env.PAYTM_INTENT_SIGN || ''}&featuretype=money_transfer`;
  const payload = {
    p2pPaymentCheckoutParams: {
      checkoutType: 'COLLECT', initialAmount: Math.round(Number(amount) * 100),
      note: { type: 'text', message: ref }, supportedInstruments: -1,
    },
    contact: { type: 'EXTERNAL_MERCHANT', name: merchantName || 'Store', vpa: upiId },
  };
  const phonepeIntent = 'phonepe://native?data=' + encodeURIComponent(Buffer.from(JSON.stringify(payload)).toString('base64')) + '&id=p2ppayment';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiUrl)}&size=220x220`;
  return { upiUrl, paytmIntent, phonepeIntent, qrCodeUrl };
}
