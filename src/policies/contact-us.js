import React from "react";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
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
            Contact Us
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#5b6475] mt-4 leading-7 max-w-4xl">
            For order, payment, shipping, return, refund,
            or general support, contact our support team.
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
                  index === 6
                    ? "bg-[#edf3ff] text-[#0d47c9] border-[#bfd0ff]"
                    : "bg-[#f3f4f6] text-[#0d47c9] border-[#d8dee9]"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

        </div>

        {/* Support Section */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            Support
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              Email: support@trendvero.shop
            </li>

            <li>
              Please include your order ID,
              registered mobile number,
              payment reference if available,
              and a short description of the issue.
            </li>

            <li>
              Support requests are usually reviewed
              within 1 to 2 business days.
            </li>

          </ul>

        </div>

        {/* Customer Help Section */}
        <div className="mt-5 bg-[#f8f8f8] border border-[#d9e0ea] rounded-[18px] p-5">

          <h2 className="text-[#0d47c9] text-[20px] font-bold">
            Customer Help
          </h2>

          <ul className="mt-4 space-y-4 text-[16px] text-[#263246] leading-7 list-disc pl-5">

            <li>
              For delivery issues, share the complete shipping address
              and tracking details if available.
            </li>

            <li>
              For damaged or incorrect products,
              share clear photos or video of the package and product.
            </li>

            <li>
              For refund issues, share the payment reference
              or UPI transaction ID where available.
            </li>

          </ul>

        </div>

        {/* Footer */}
        <div className="text-center text-[14px] text-[#6b7280] mt-5 pb-3">
          For help, contact support@trendvero.shop.
          Last updated: May 15, 2026.
        </div>

      </div>
    </div>
  );
};

export default ContactUs;