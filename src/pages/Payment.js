import React, { useEffect, useState } from "react";
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
    const index = Number(localStorage.getItem("id"));

    if (!Number.isNaN(index) && Data[index]) {
      setData(Data[index]);
    }
  }, []);

  // ================================
  // DATA
  // ================================
  const price = data?.price ?? 0;

  const cancelPrice =
    data?.cancelprice ?? 0;


  // ================================
  // PAYMENT HELPERS
  // ================================
  const isValidUpiId = (upiId) =>
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,255}@[A-Za-z0-9][A-Za-z0-9.-]{1,63}$/.test(
      upiId
    );

  const getValidAmount = (rawAmount) => {
    const normalized = String(
      rawAmount ?? ""
    )
      .trim()
      .replace(/₹/g, "")
      .replace(/,/g, "");

    if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
      return null;
    }

    const numericAmount = Number(normalized);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return null;
    }

    const formattedAmount =
      numericAmount.toFixed(2);

    return /^\d+\.\d{2}$/.test(
      formattedAmount
    )
      ? formattedAmount
      : null;
  };


  // ================================
  // PHONEPE NATIVE INTENT
  // ================================
  function openPhonePe({
    upiId,
    amount,
    paymentNote,
    payeeName,
  }) {
    const paymentData = {
      "p2pPaymentCheckoutParams": {
        "checkoutType": "COLLECT",
        "initialAmount": Math.round(
          Number(amount) * 100
        ),
        // Actual amount in paise
        "note": {
          "type": "text",
          "message": paymentNote
        },
        "supportedInstruments": -1
      },
      "contact": {
        "type": "EXTERNAL_MERCHANT",
        "name": payeeName,
        "vpa": upiId
      }
    };

    const jsonStr =
      JSON.stringify(paymentData);

    const encodedData = btoa(
      unescape(
        encodeURIComponent(jsonStr)
      )
    );

    return (
      "phonepe://native?data=" +
      encodeURIComponent(encodedData) +
      "&id=p2ppayment"
    );
  }


  // ================================
  // PAYTM CASH WALLET DEEPLINK
  // ================================
  function openPaytm({
    upiId,
    amount,
    paymentNote,
    payeeName,
  }) {
    return `paytmmp://cash_wallet?pa=${encodeURIComponent(
      upiId
    )}&am=${amount}&tn=${encodeURIComponent(
      paymentNote
    )}&pn=${encodeURIComponent(
      payeeName
    )}&mc=&cu=INR&url=&mode=&purpose=&orgid=&sign=&featuretype=money_transfer`;
  }


  // ================================
  // PAYMENT FUNCTION
  // ================================
  const handlePayment = () => {
    const appConfig =
      window.APP_CONFIG ?? {};

    const upiId = String(
      appConfig.UPI_ID ?? ""
    ).trim();

    if (!upiId) {
      alert("UPI ID is not configured.");
      return;
    }

    if (!isValidUpiId(upiId)) {
      alert("Configured UPI ID is invalid.");
      return;
    }

    const orderNumber =
      Math.floor(Math.random() * 900000000) +
      100000000;

    const amount =
      getValidAmount(price);

    if (!amount) {
      alert("Payment amount is invalid or unavailable.");
      return;
    }

    const paymentNote =
      `Orderid-${orderNumber}`;

    // This project only configures a UPI ID, so use it
    // as the payee label instead of inventing a brand name.
    const payeeName = upiId;

    let redirectUrl = "";

    // ================================
    // PAYMENT METHOD SWITCH
    // ================================
    switch (selected) {

      // -------------------------------
      // GOOGLE PAY
      // -------------------------------
      case "gpay":

        redirectUrl =
          `tez://upi/pay?pa=${encodeURIComponent(
            upiId
          )}` +
          `&pn=${encodeURIComponent(
            payeeName
          )}` +
          `&am=${amount}` +
          `&cu=INR` +
          `&tn=${encodeURIComponent(
            paymentNote
          )}`;

        break;


      // -------------------------------
      // PHONEPE
      // -------------------------------
      case "phonepe":

        redirectUrl = openPhonePe({
          upiId,
          amount,
          paymentNote,
          payeeName,
        });

        break;


      // -------------------------------
      // PAYTM
      // -------------------------------
      case "paytm":

        redirectUrl = openPaytm({
          upiId,
          amount,
          paymentNote,
          payeeName,
        });

        break;


      default:

        alert(
          "Please select payment method"
        );

        return;
    }

    // ================================
    // CREATE ORDER BEFORE PAYMENT
    // ================================
    setIsPaying(true);

    fetch(
      "/api/create-order",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          orderNumber: orderNumber,
          amount: amount,
          upiId: upiId,
          payType: selected,
        }),

        keepalive: true,
      }
    ).catch((error) => {
      console.error(
        "Create order error:",
        error
      );
    });

    // ================================
    // REDIRECT TO PAYMENT APP
    // ================================
    window.location.href =
      redirectUrl;

    window.setTimeout(() => {
      setIsPaying(false);
    }, 1500);
  };


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

      <style>{`

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
