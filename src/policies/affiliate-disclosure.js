import React from "react";
import { useNavigate } from "react-router-dom";

const AffiliateDisclosure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2f97f3] to-[#8cc3f3] py-10 px-4">

      {/* Main Wrapper */}
      <div className="max-w-6xl mx-auto">

        {/* Top Header */}
        <div className="bg-[#f8f8f8] rounded-[22px] px-6 py-4 flex items-center justify-between shadow-sm">

          {/* Left */}
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2f97f3] to-[#1d4ed8] flex items-center justify-center text-white font-bold text-[14px]">
              ST
            </div>

            <h2 className="text-[#0f2b6d] font-bold text-[28px]">
              Store Policies
            </h2>

          </div>

          {/* Center */}
          <div className="hidden md:block text-[#163c8f] font-bold tracking-[2px] text-[14px] uppercase">
            Policy Center
          </div>

          {/* Right */}
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#2f97f3] to-[#1d4ed8] text-white px-6 py-3 rounded-full text-[14px] font-semibold shadow-md hover:scale-105 transition-all duration-300"
          >
            Back to Home
          </button>

        </div>

        {/* Policy Card */}
        <div className="mt-5 bg-[#f8f8f8] rounded-[24px] p-7 shadow-sm">

          {/* Heading */}
          <h1 className="text-[#0f2b6d] text-[24px] sm:text-[40px] font-bold leading-none">
            Affiliate Disclosure
          </h1>

          {/* Content */}
          <div className="mt-8 space-y-7 text-[#263246] text-[17px] leading-9">

            <p>
              This website may contain affiliate, referral,
              sponsored, or partner links on selected pages.
            </p>

            <p>
              If you click an affiliate or referral link and make
              a purchase from a third-party seller or marketplace,
              we may earn a commission at no additional cost to you.
            </p>

            <p>
              Affiliate links do not change the product price you pay.
              Product pricing, delivery, refunds, returns,
              and warranties for third-party purchases are controlled
              by the respective seller or marketplace.
            </p>

          </div>

          {/* Footer */}
          <div className="mt-10 text-[#374151] text-[15px] font-medium">
            Last updated: May 15, 2026.
          </div>

        </div>

      </div>
    </div>
  );
};

export default AffiliateDisclosure;