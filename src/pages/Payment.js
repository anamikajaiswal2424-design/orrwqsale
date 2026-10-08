import React, { useEffect, useRef, useState } from "react";

import Data from "../Data";



import Gpay from "../assets/gpay_icon.svg";

import Phonepe from "../assets/phonepe.svg";

import Paytm from "../assets/paytm_icon.svg";

import Upi from "../assets/upi.svg";

import Lock from "../assets/lock.svg";



export default function Payment() {

  const [selected, setSelected] = useState("phonepe");

  const [data, setData] = useState({});

  const [isPaying, setIsPaying] = useState(false);



  // ================================

  // PAYMENT OPTIONS

  // ================================

  const upiOptions = [

    {

      id: "phonepe",

      name: "PhonePe",

      discount: "20% Extra Discount By PhonePe",

      logo: Phonepe,

    },

    {

      id: "gpay",

      name: "GPay",

      discount: "20% Extra Discount By GPay",

      logo: Gpay,

    },

    {

      id: "paytm",

      name: "PayTM",

      discount: "15% Extra Discount By Paytm",

      logo: Paytm,

    },

  ];



  // ================================

  // LOAD PRODUCT DATA

  // ================================

  useEffect(() => {
    let cartItems = [];
    try {
      cartItems = JSON.parse(localStorage.getItem("checkout_cart") || localStorage.getItem("cart_items") || "[]");
    } catch {}

    if (Array.isArray(cartItems) && cartItems.length) {
      const totals = cartItems.reduce((acc, item) => {
        const qty = Number(item.qty) || 1;
        const price = Number(item.selling_price ?? item.price) || 0;
        const mrp = Number(item.mrp ?? item.cancelprice ?? price) || price;
        acc.price += price * qty;
        acc.cancelprice += mrp * qty;
        return acc;
      }, { price: 0, cancelprice: 0 });
      setData({ ...cartItems[0], ...totals, cart_items: cartItems });
      localStorage.setItem("checkout_total", String(totals.price));
      return;
    }

    const index = Number(localStorage.getItem("id"));
    if (!Number.isNaN(index) && Data[index]) setData(Data[index]);
  }, []);



  // React dev server runs on localhost:3000; the Node payment API runs on 3001.
  // Set APP_CONFIG.PAYMENT_API_BASE to override this for deployment.
  const configuredApi = typeof window !== "undefined" ? window.APP_CONFIG?.PAYMENT_API_BASE : null;
  const isLocal = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
  // On localhost use the separate Node server even if APP_CONFIG has "/".
  const API_BASE = (isLocal ? "http://localhost:3001/" : (configuredApi || "/")).replace(/\/?$/, "/");
  const pollTimer = useRef(null);
  const holdTimer = useRef(null);
  const pollBusy = useRef(false);
  const pollCount = useRef(0);
  const activeRef = useRef("");
  const holdUntil = useRef(0);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [paymentFailure, setPaymentFailure] = useState(false);

  const stopPaymentPolling = () => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = null;
    document.removeEventListener("visibilitychange", onPaymentReturn);
    window.removeEventListener("focus", onPaymentReturn);
  };

  const checkPayment = async (txnRef) => {
    if (pollBusy.current || activeRef.current !== txnRef) return;
    pollBusy.current = true;
    try {
      const response = await fetch(API_BASE + "api/payment/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "txnRef=" + encodeURIComponent(txnRef),
        cache: "no-store",
      });
      if (!response.ok) return;
      const result = await response.json();
      if (!result?.ok || activeRef.current !== txnRef) return;
      if (result.status === "success") {
        stopPaymentPolling();
        activeRef.current = "";
        let record = {};
        try { record = JSON.parse(localStorage.getItem("pending_payment")) || {}; } catch {}
        record.status = "success";
        record.utr = result.utr || "";
        record.confirmed_at = new Date().toISOString();
        localStorage.setItem("completed_order", JSON.stringify(record));
        window.location.replace("/thankyou");
      } else if (result.status === "failure") {
        stopPaymentPolling();
        activeRef.current = "";
        setPaymentFailure(true);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
    } finally {
      pollBusy.current = false;
    }
  };

  const onPaymentReturn = () => {
    if (document.visibilityState === "visible" && activeRef.current) {
      checkPayment(activeRef.current);
    }
  };

  const startPaymentPolling = (txnRef) => {
    stopPaymentPolling();
    activeRef.current = txnRef;
    pollCount.current = 0;
    pollTimer.current = setInterval(() => {
      if (++pollCount.current > 300) {
        stopPaymentPolling();
        activeRef.current = "";
        return;
      }
      checkPayment(txnRef);
    }, 3000);
    document.addEventListener("visibilitychange", onPaymentReturn);
    window.addEventListener("focus", onPaymentReturn);
  };

  const showPaymentProcessing = (record) => {
    setPendingPayment(record);
    setPaymentFailure(false);
    holdUntil.current = Date.now() + 30000;
    setRemaining(30000);
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = setInterval(() => {
      const left = Math.max(0, holdUntil.current - Date.now());
      setRemaining(left);
      if (!left) {
        clearInterval(holdTimer.current);
        holdTimer.current = null;
      }
    }, 500);
  };

  const changePaymentMethod = () => {
    if (Date.now() < holdUntil.current) return;
    activeRef.current = "";
    stopPaymentPolling();
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = null;
    setPendingPayment(null);
    setPaymentFailure(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => () => {
    activeRef.current = "";
    if (pollTimer.current) clearInterval(pollTimer.current);
    if (holdTimer.current) clearInterval(holdTimer.current);
    document.removeEventListener("visibilitychange", onPaymentReturn);
    window.removeEventListener("focus", onPaymentReturn);
  }, []);

  const handlePayment = async () => {
    if (!selected) {
      alert("Please select payment method");
      return;
    }
    if (isPaying || activeRef.current) return;

    const amount = Number.parseFloat(data?.price || 0).toFixed(2);
    if (Number(amount) <= 0) {
      alert("Payment amount is not available.");
      return;
    }

    try {
      setIsPaying(true);
      const response = await fetch(API_BASE + "api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "amount=" + encodeURIComponent(amount) +
          "&pay_type=" + encodeURIComponent(selected),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Payment API returned ${response.status} instead of JSON. Check that the Node API is running at ${API_BASE}`);
      }
      const init = await response.json();
      if (!response.ok || !init?.ok || !init?.upiId || !init?.txnRef) {
        throw new Error(init?.error || `Payment initiation failed (HTTP ${response.status})`);
      }

      let redirectUrl;
      switch (selected) {
        case "phonepe": redirectUrl = init.phonepeIntent; break;
        case "paytm": redirectUrl = init.paytmIntent; break;
        case "gpay": redirectUrl = init.upiUrl; break;
        default: throw new Error("Please select payment method");
      }
      redirectUrl ||= init.upiUrl;
      if (!redirectUrl) throw new Error("Payment link is missing");

      let cartItems = [], address = {};
      try { cartItems = JSON.parse(localStorage.getItem("cart_items")) || []; } catch {}
      address = { name: localStorage.getItem("fname") || "", address: localStorage.getItem("address") || "", mobile: localStorage.getItem("mobile") || "" };
      const record = {
        order_id: "ORD" + String(init.orderNumber || "").slice(-10),
        transaction_id: init.txnRef,
        txn_ref: init.txnRef,
        value: Number(amount),
        currency: "INR",
        payment_method: selected,
        created_at: new Date().toISOString(),
        item: data,
        cart_items: cartItems,
        address,
      };
      localStorage.setItem("pending_payment", JSON.stringify(record));
      showPaymentProcessing(record);
      startPaymentPolling(init.txnRef);
      window.setTimeout(() => { window.location.href = redirectUrl; }, 180);
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert(error.message || "Could not start the payment. Please check your connection and try again.");
    } finally {
      setIsPaying(false);
    }
  };

  const price = data?.price ?? 0;

  const cancelPrice =

    data?.cancelprice ?? 0;





  // ================================

  // UI

  // ================================

  return (



    <div className="payment-page">



      <div className="payment-shell">





        {/* ======================================

            HEADER

        ====================================== */}



        <header className="payment-header">



          <button

            type="button"

            className="back-button"

            onClick={() =>

              window.history.back()

            }

            aria-label="Go back"

          >



            <svg

              width="19"

              height="16"

              viewBox="0 0 19 16"

              aria-hidden="true"

            >



              <path

                d="M17.556 7.847H1M7.45 1L1 7.877l6.45 6.817"

                stroke="currentColor"

                strokeWidth="1.5"

                strokeLinecap="round"

                strokeLinejoin="round"

                fill="none"

              />



            </svg>



          </button>





          <div className="header-title">



            <div className="step-text">

              Step 3 of 3

            </div>



            <h1>

              Payments

            </h1>



          </div>





          <div className="secure-badge">



            <img

              src={Lock}

              alt=""

            />



            <span>

              100% Secure

            </span>



          </div>



        </header>







        {/* ======================================

            UPI SECTION

        ====================================== */}



        <section className="upi-section">





          <div className="upi-heading">



            <img

              src={Upi}

              alt="UPI"

            />



            <span>

              UPI

            </span>



            <span className="upi-chevron">

              ⌃

            </span>



          </div>







          <div className="upi-list">





            {upiOptions.map(

              (option) => {



                const active =

                  selected ===

                  option.id;





                return (



                  <button

                    type="button"

                    key={option.id}



                    className={`upi-option ${

                      active

                        ? "active"

                        : ""

                    }`}



                    onClick={() =>

                      setSelected(

                        option.id

                      )

                    }

                  >





                    {/* RADIO */}



                    <span

                      className={`radio ${

                        active

                          ? "checked"

                          : ""

                      }`}

                    >



                      {active && (

                        <span />

                      )}



                    </span>







                    {/* TEXT */}



                    <span className="upi-content">



                      <span className="upi-name-row">



                        <strong>



                          ₹{price}



                          <em>

                            |

                          </em>



                          {option.name}



                        </strong>



                      </span>





                      <span

                        className={`upi-discount ${option.id}`}

                      >

                        {

                          option.discount

                        }

                      </span>



                    </span>







                    {/* LOGO */}



                    <img

                      className="upi-logo"

                      src={option.logo}

                      alt={

                        option.name

                      }

                    />



                  </button>



                );

              }

            )}



          </div>



        </section>







        {/* ======================================

            CASHBACK

        ====================================== */}



        <section className="cashback-box">



          <h2>

            Cashback on First Order!

          </h2>





          <p>



            Place your order on this

            Flipkart product and get{" "}



            <strong>

              ₹500 cashback!

            </strong>



            Cashback will be credited

            to your original UPI

            payment method

            (QR/PhonePe/Paytm/Gpay)

            after your order is

            delivered to you.



          </p>



        </section>







        {/* ======================================

            ORDER SUMMARY

        ====================================== */}



        <section className="summary-box">





          <div className="summary-row">



            <span>

              Price (1 item)

            </span>



            <span>

              ₹{price}

            </span>



          </div>







          <div className="summary-row">



            <span>

              Delivery Charges

            </span>



            <span className="free">

              FREE

            </span>



          </div>







          <div className="summary-row">



            <span>

              Discount fee

            </span>



            <span className="old-price">

              ₹{cancelPrice}

            </span>



          </div>







          <div className="summary-divider" />







          <div className="summary-total">



            <span>



              Total Amount



              <span className="up-arrow">

                ⌃

              </span>



            </span>



            <strong>

              ₹{price}

            </strong>



          </div>





        </section>







        {/* ======================================

            TRUST SECTION

        ====================================== */}



        <section className="trust-section">





          <div className="trust-item">



            <div className="trust-icon">

              📦

            </div>



            <strong>

              7 Day Return

            </strong>



          </div>







          <div className="trust-line" />







          <div className="trust-item">



            <div className="trust-icon">

              ₹

            </div>



            <strong>

              7 Day Refunds

            </strong>



          </div>







          <div className="trust-line" />







          <div className="trust-item">



            <div className="trust-icon">

              ✓

            </div>



            <strong>

              Genuine Products

            </strong>



          </div>







          <div className="trust-line" />







          <div className="trust-item">



            <div className="trust-icon">

              🚚

            </div>



            <strong>

              Delivery in 2 Days

            </strong>



          </div>





        </section>







        {/* ======================================

            SECURE PAYMENT

        ====================================== */}



        <section className="secure-payment">





          <h3>

            Secure Payment By

          </h3>





          <div className="secure-logos">





            <img

              src={Phonepe}

              alt="PhonePe"

            />





            <span />





            <img

              src={Paytm}

              alt="Paytm"

            />





            <span />





            <img

              src={Upi}

              alt="UPI"

            />





          </div>





        </section>







        {/* ======================================

            BOTTOM PAYMENT BUTTON

        ====================================== */}



        <footer className="payment-footer">





          <strong>

            ₹{price}

          </strong>





          <button

            type="button"

            onClick={handlePayment}

            disabled={isPaying}

          >



            {isPaying

              ? "PLEASE WAIT..."

              : "PROCEED TO PAY"}



          </button>





        </footer>





      </div>







      {/* ======================================

          CSS

      ====================================== */}



      {pendingPayment && (
        <div className="payment-processing-overlay" role="status" aria-live="polite">
          <div className="payment-processing-card">
            <img
              src={selected === "phonepe" ? Phonepe : selected === "paytm" ? Paytm : Gpay}
              alt={selected + " logo"}
              width="56"
              height="56"
            />
            <h2>{paymentFailure ? "Payment could not be confirmed" : "Verifying your payment"}</h2>
            <p>₹{Number(pendingPayment.value).toLocaleString("en-IN")}</p>
            <p>Order: {pendingPayment.order_id}</p>
            {!paymentFailure && <p>Return from your payment app to check the status.</p>}
            {remaining > 0 ? (
              <span className="payment-hold-timer">{Math.ceil(remaining / 1000)}s</span>
            ) : (
              <button type="button" onClick={changePaymentMethod}>Try a different method</button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .payment-processing-overlay {
          position: fixed; inset: 0; z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; background: #fff;
        }
        .payment-processing-card { width: 100%; max-width: 420px; text-align: center; }
        .payment-processing-card img { object-fit: contain; }
        .payment-processing-card button {
          margin-top: 18px; padding: 12px 18px; border: 0;
          border-radius: 8px; background: #111; color: #fff;
        }
        .payment-hold-timer {
          display: inline-block; margin-top: 16px; padding: 7px 14px;
          border-radius: 20px; background: #eee;
        }




        * {

          box-sizing: border-box;

        }





        body {

          margin: 0;

          padding: 0;

        }





        .payment-page {



          min-height: 100vh;



          background: #f1f3f6;



          color: #111827;



          font-family:

            Inter,

            Arial,

            sans-serif;



        }







        .payment-shell {



          width: 100%;



          max-width: 100%;



          min-height: 100vh;



          margin: 0 auto;



          background: #fff;



          position: relative;



          padding-bottom: 86px;



          overflow-x: hidden;



        }







        /* ==================================

           HEADER

        ================================== */



        .payment-header {



          height: 72px;



          display: grid;



          grid-template-columns:

            42px

            1fr

            auto;



          align-items: center;



          gap: 4px;



          padding: 0 12px;



          border-bottom:

            1px solid #f0f0f0;



          background: #fff;



        }







        .back-button {



          width: 34px;



          height: 38px;



          border: 0;



          background:

            transparent;



          display: flex;



          align-items: center;



          justify-content: center;



          padding: 0;



          cursor: pointer;



          color: #111;



        }







        .header-title {



          min-width: 0;



        }







        .step-text {



          font-size: 12px;



          line-height: 15px;



          color: #222;



        }







        .header-title h1 {



          margin:

            2px 0 0;



          font-size: 17px;



          line-height: 21px;



          font-weight: 650;



          color: #111;



        }







        .secure-badge {



          height: 32px;



          min-width: 115px;



          padding: 0 9px;



          border-radius: 5px;



          background: #f5f5f5;



          display: flex;



          align-items: center;



          justify-content: center;



          gap: 7px;



          white-space: nowrap;



        }







        .secure-badge img {



          width: 15px;



          height: 15px;



          object-fit: contain;



        }







        .secure-badge span {



          font-size: 12px;



          font-weight: 650;



        }







        /* ==================================

           UPI

        ================================== */



        .upi-section {



          background: #f7f7f7;



          padding:

            14px

            11px

            10px;



        }







        .upi-heading {



          height: 42px;



          display: flex;



          align-items: center;



          gap: 10px;



          padding:

            0 2px 8px;



          font-size: 16px;



          font-weight: 600;



        }







        .upi-heading img {



          width: 25px;



          height: 25px;



          object-fit: contain;



        }







        .upi-chevron {



          margin-left: auto;



          font-size: 25px;



          line-height: 20px;



          font-weight: 700;



          transform:

            translateY(4px);



        }







        .upi-list {



          background: #fff;



          border-radius: 7px;



          overflow: hidden;



          box-shadow:

            0 1px 5px

            rgba(0,0,0,.08);



        }







        .upi-option {



          width: 100%;



          min-height: 81px;



          border: 0;



          border-bottom:

            1px solid #e2e2e2;



          background: #fff;



          display: flex;



          align-items: center;



          text-align: left;



          padding:

            12px 14px;



          cursor: pointer;



          gap: 11px;



        }







        .upi-option:last-child {



          border-bottom: 0;



        }







        .upi-option.active {



          background: #fff;



        }







        /* RADIO */



        .radio {



          width: 21px;



          height: 21px;



          border:

            1.5px solid #8d8d8d;



          border-radius: 50%;



          flex:

            0 0 21px;



          display: flex;



          align-items: center;



          justify-content: center;



        }







        .radio.checked {



          border-color: #1683ff;



        }







        .radio.checked span {



          width: 11px;



          height: 11px;



          border-radius: 50%;



          background: #1683ff;



        }







        .upi-content {



          flex: 1;



          min-width: 0;



          display: flex;



          flex-direction: column;



          gap: 5px;



        }







        .upi-name-row strong {



          display: block;



          font-size: 15px;



          line-height: 18px;



          font-weight: 700;



          color: #111;



          white-space: nowrap;



        }







        .upi-name-row em {



          font-style: normal;



          color: #555;



          margin:

            0 2px;



        }







        .upi-discount {



          display: block;



          font-size: 13px;



          line-height: 16px;



        }







        .upi-discount.phonepe {



          color: #7134bd;



        }







        .upi-discount.gpay {



          color: #0d9b48;



        }







        .upi-discount.paytm {



          color: #078ad8;



        }







        .upi-logo {



          width: 32px;



          max-height: 32px;



          object-fit: contain;



          flex:

            0 0 32px;



        }







        /* ==================================

           CASHBACK

        ================================== */



        .cashback-box {



          margin:

            14px

            19px

            18px;



          padding:

            17px

            20px

            18px;



          border-radius: 8px;



          background: #e9fbef;



          border:

            1px solid #d8f4df;



        }







        .cashback-box h2 {



          margin:

            0 0 7px;



          color: #079b2b;



          font-size: 18px;



          line-height: 22px;



          font-weight: 700;



        }







        .cashback-box p {



          margin: 0;



          color: #202020;



          font-size: 14px;



          line-height: 20px;



        }







        .cashback-box strong {



          font-weight: 750;



        }







        /* ==================================

           SUMMARY

        ================================== */



        .summary-box {



          margin:

            0 19px

            19px;



          padding:

            13px

            11px

            15px;



          background: #f1f5ff;



          border-radius: 8px;



          font-size: 14px;



        }







        .summary-row {



          min-height: 29px;



          display: flex;



          justify-content:

            space-between;



          align-items: center;



        }







        .summary-row .free {



          color: #079b2b;



        }







        .old-price {



          color: #999;



          text-decoration:

            line-through;



        }







        .summary-divider {



          border-top:

            1px dotted #bbb;



          margin:

            1px 0 8px;



        }







        .summary-total {



          display: flex;



          align-items: center;



          justify-content:

            space-between;



          color: #1459ed;



          font-size: 15px;



        }







        .summary-total strong {



          font-size: 15px;



        }







        .up-arrow {



          font-size: 18px;



          margin-left: 4px;



        }







        /* ==================================

           TRUST

        ================================== */



        .trust-section {



          margin:

            0 19px;



          display: flex;



          align-items:

            flex-start;



          justify-content:

            space-between;



          border-bottom:

            1px solid #dedede;



          padding:

            2px 0 10px;



        }







        .trust-item {



          width: 24%;



          text-align: center;



          display: flex;



          flex-direction: column;



          align-items: center;



          gap: 4px;



        }







        .trust-icon {



          width: 30px;



          height: 30px;



          display: flex;



          align-items: center;



          justify-content: center;



          font-size: 24px;



          line-height: 1;



        }







        .trust-item strong {



          font-size: 9px;



          line-height: 11px;



          font-weight: 650;



          white-space: nowrap;



        }







        .trust-line {



          height: 39px;



          width: 1px;



          background: #333;



          margin-top: 0;



        }







        /* ==================================

           SECURE PAYMENT

        ================================== */



        .secure-payment {



          padding:

            10px

            19px

            14px;



          text-align: center;



        }







        .secure-payment h3 {



          margin:

            0 0 8px;



          font-size: 15px;



          line-height: 19px;



          font-weight: 700;



        }







        .secure-logos {



          display: flex;



          align-items: center;



          justify-content: center;



          gap: 13px;



        }







        .secure-logos img {



          width: 66px;



          height: 28px;



          object-fit: contain;



        }







        .secure-logos img:nth-of-type(3) {



          width: 63px;



        }







        .secure-logos span {



          height: 27px;



          width: 1px;



          background: #777;



        }







        /* ==================================

           FOOTER

        ================================== */



        .payment-footer {



          position: fixed;



          left: 50%;



          bottom: 0;



          transform:

            translateX(-50%);



          width: 100%;



          max-width: 375px;



          height: 78px;



          padding:

            13px 11px;



          background: #fff;



          border-top:

            1px solid #e5e5e5;



          box-shadow:

            0 -2px 8px

            rgba(0,0,0,.04);



          display: flex;



          align-items: center;



          justify-content:

            space-between;



          z-index: 50;



        }







        .payment-footer > strong {



          font-size: 16px;



          font-weight: 500;



          color: #333;



        }







        .payment-footer button {



          min-width: 176px;



          height: 43px;



          border: 0;



          border-radius: 6px;



          background: #ffc107;



          color: #080808;



          font-size: 13px;



          font-weight: 800;



          cursor: pointer;



          box-shadow:

            0 1px 2px

            rgba(0,0,0,.08);



        }







        .payment-footer button:hover {



          background: #ffb900;



        }







        .payment-footer button:disabled {



          opacity: .65;



          cursor: not-allowed;



        }







        /* ==================================

           DESKTOP

        ================================== */



        @media (min-width: 600px) {



          .payment-page {



            padding:

              20px 0;



          }







          .payment-shell {



            min-height:

              calc(100vh - 40px);



            border-radius: 3px;



            box-shadow:

              0 2px 12px

              rgba(0,0,0,.12);



          }







          .payment-footer {



            border-radius:

              0 0 3px 3px;



          }



        }



      `}</style>



    </div>

  );

}