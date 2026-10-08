import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentSecurityPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#edf2fa] py-8 px-4">

      {/* Main Container */}
      <div className="max-w-5xl mx-auto">

        {/* Top Card */}
        <div className="bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          {/* Top Row */}
          <div className="flex items-center justify-between">

            <button
              onClick={() => navigate("/")}
              className="text-[#0d47c9] text-[15px] font-semibold"
            >
              Back to Store
            </button>

            <div className="bg-[#e9eefc] text-[#0d47c9] text-[12px] font-semibold px-4 py-2 rounded-full">
              Policy Center
            </div>

          </div>

          {/* Heading */}
          <h1 className="text-[24px] sm:text-[40px] leading-none font-bold text-[#0f172a] mt-5">
            Payment & Security
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#5b6475] mt-4 leading-7 max-w-4xl">
            This Payment & Security Policy explains payment options
            and safe payment practices.
          </p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mt-6">

            {[
              "Shipping",
              "Returns & Refunds",
              "Cancellation",
              "Payment Security",
              "Privacy",
              "Terms",
              "Contact",
            ].map((item, index) => (
              <button
                key={index}
                className={`px-5 py-3 rounded-full text-[14px] font-semibold border
                ${
                  index === 3
                    ? "bg-[#edf3ff] text-[#0d47c9] border-[#bfd0ff]"
                    : "bg-[#f3f4f6] text-[#0d47c9] border-[#d8dee9]"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

        </div>

        {/* Section Card */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            Payment Options
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              Available payment methods may include UPI, QR payment,
              debit cards, credit cards, wallets, net banking,
              or cash on delivery depending on availability.
            </li>

            <li>
              The final payable amount is displayed before
              order confirmation during checkout.
            </li>

            <li>
              Payment availability may vary depending on
              device, location, serviceability, or order value.
            </li>

          </ul>

        </div>

        {/* Section Card */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            Security
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              We never ask customers to share card PIN,
              UPI PIN, OTP, CVV, or banking passwords with support.
            </li>

            <li>
              Payments should only be completed through
              the official checkout flow or verified payment links.
            </li>

            <li>
              If you notice any suspicious payment request,
              contact support before making payment.
            </li>

          </ul>

        </div>

        {/* Section Card */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            Payment Issues
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              If money is debited but the order is not confirmed,
              contact support with transaction details.
            </li>

            <li>
              Failed or duplicate payments are reviewed
              and refunded where applicable after verification.
            </li>

            <li>
              Refund timelines may vary depending on
              the bank, wallet, or payment provider used.
            </li>

          </ul>

        </div>

        {/* Footer */}
        <div className="text-center text-[14px] text-[#6b7280] mt-5 pb-3">
          For help, contact support@trendvero.shop. Last updated: May 15, 2026.
        </div>

      </div>
    </div>
  );
};

export default PaymentSecurityPolicy;