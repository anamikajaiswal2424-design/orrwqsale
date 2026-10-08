import React from "react";
import { useNavigate } from "react-router-dom";

const ShippingPolicy = () => {
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
            Shipping Policy
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#5b6475] mt-4 leading-7 max-w-4xl">
            This Shipping Policy explains dispatch, delivery timelines,
            tracking, and delivery support for orders placed on this website.
          </p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">

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
                className={`px-5 py-3 rounded-full text-[13px] font-semibold border
                ${
                  index === 0
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
            Order Processing
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">
            <li>
              Orders are usually processed within 1 to 3 business days after
              order confirmation and successful payment where prepaid payment is
              selected.
            </li>

            <li>
              Orders placed on Sundays or public holidays may be processed on
              the next business day.
            </li>

            <li>
              If an item is unavailable after order placement, we will contact
              you for replacement, delay approval, or refund.
            </li>
          </ul>

        </div>

        {/* Section Card */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            Delivery Timeline
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              Estimated delivery is generally 3 to 7 business days for major
              cities and 5 to 10 business days for other serviceable locations.
            </li>

            <li>
              Delivery timelines can vary due to courier delays, weather,
              address issues, payment verification, or local restrictions.
            </li>

            <li>
              A tracking update may be shared by SMS, email, WhatsApp, or order
              status page when available.
            </li>

          </ul>

        </div>

        {/* Section Card */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            Shipping Charges
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              Shipping charges, if any, are shown before checkout or included
              in the final payable amount.
            </li>

            <li>
              If free shipping is offered, it applies only to eligible orders
              and serviceable pin codes.
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

export default ShippingPolicy;