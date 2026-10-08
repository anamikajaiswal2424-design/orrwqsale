import React from "react";
import { useNavigate } from "react-router-dom";

const CancellationPolicy = () => {
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
            Cancellation Policy
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#5b6475] mt-4 leading-7 max-w-4xl">
            This Cancellation Policy explains when an order can be cancelled
            and how cancellation requests are processed.
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
                  index === 2
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
            Before Dispatch
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              Orders can usually be cancelled before they are packed
              or dispatched from our warehouse.
            </li>

            <li>
              Customers should contact support as soon as possible
              with their order details for cancellation requests.
            </li>

            <li>
              Once the order is prepared for shipment, cancellation
              may not be guaranteed.
            </li>

          </ul>

        </div>

        {/* Section Card */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            After Dispatch
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              If the order has already been dispatched, cancellation
              may no longer be possible.
            </li>

            <li>
              Customers may refuse delivery where applicable or request
              a return after delivery according to the Return & Refund Policy.
            </li>

            <li>
              Shipping, handling, or processing charges may be non-refundable
              once shipment has started.
            </li>

          </ul>

        </div>

        {/* Section Card */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            Refund For Cancelled Orders
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              Approved cancellation refunds are generally initiated
              within 5 to 7 business days.
            </li>

            <li>
              Refunds will be processed to the original payment method
              whenever possible.
            </li>

            <li>
              Bank or payment provider processing time may vary depending
              on the selected payment method.
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

export default CancellationPolicy;