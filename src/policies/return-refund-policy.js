import React from "react";
import { useNavigate } from "react-router-dom";

const ReturnRefundPolicy = () => {
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
            Return & Refund Policy
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#5b6475] mt-4 leading-7 max-w-4xl">
            This Return & Refund Policy explains when products can be
            returned and how refunds are handled.
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
                  index === 1
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
            Return Eligibility
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              Returns may be accepted within 7 days of delivery for damaged,
              defective, missing, or incorrect products.
            </li>

            <li>
              The product must be unused, with original packaging, tags,
              accessories, manuals, and invoice where applicable.
            </li>

            <li>
              Return requests can be rejected if the item is used, altered,
              damaged after delivery, or missing original components.
            </li>

          </ul>

        </div>

        {/* Section Card */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            How To Request A Return
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              Contact support with your order details, delivery date,
              issue description, and clear photos or video of the product
              and packaging.
            </li>

            <li>
              After review, support will confirm whether pickup,
              replacement, refund, or another resolution is applicable.
            </li>

            <li>
              Please do not send any product back without support confirmation.
            </li>

          </ul>

        </div>

        {/* Section Card */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            Refund Timeline
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              Approved refunds are usually initiated within 5 to 7 business
              days after return pickup and quality check.
            </li>

            <li>
              Refunds are sent to the original payment method where possible.
              Bank or payment provider processing time may vary.
            </li>

            <li>
              Cash on delivery refunds may require bank or UPI details
              from the customer.
            </li>

          </ul>

        </div>

        {/* Footer */}
        <div className="text-center text-[14px] text-[#6b7280] mt-5 pb-3">
          For help, contact support@trendvero.shop. Last updated: May 11, 2026.
        </div>

      </div>
    </div>
  );
};

export default ReturnRefundPolicy;