import React from "react";
import {
  RiTruckLine,
  RiArrowGoBackLine,
  RiForbid2Line,
  RiShieldCheckLine,
  RiLock2Line,
  RiFileList3Line,
  RiInformationLine,
  RiCustomerService2Line,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const policies = [
  { title: "Shipping Policy", icon: <RiTruckLine />, path: "/policies/shipping-policy" },
  { title: "Return & Refund", icon: <RiArrowGoBackLine />, path: "/policies/return-refund-policy" },
  { title: "Cancellation Policy", icon: <RiForbid2Line />, path: "/policies/cancellation-policy" },
  { title: "Payment & Security", icon: <RiShieldCheckLine />, path: "/policies/payment-security" },
  { title: "Privacy Policy", icon: <RiLock2Line />, path: "/policies/privacy-policy" },
  { title: "Terms & Conditions", icon: <RiFileList3Line />, path: "/policies/terms-and-conditions" },
  { title: "Affiliate Disclosure", icon: <RiInformationLine />, path: "/policies/affiliate-disclosure" },
  { title: "Contact Us", icon: <RiCustomerService2Line />, path: "/policies/contact-us" },
];

const PolicySupport = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#eef4ff] px-4 py-6 sm:py-10 flex justify-center">
      <div className="w-full max-w-6xl">

        {/* Header */}
        <div className="bg-white border border-[#dfe7f5] rounded-[22px] shadow-sm px-5 sm:px-8 py-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-[24px] sm:text-[34px] font-bold text-[#0f172a]">
                Policies & Customer Support
              </h2>
              <p className="text-[14px] sm:text-[16px] text-[#64748b] mt-2 leading-6">
                For order, payment, shipping, return, refund, or cancellation help.
              </p>
            </div>

            <a
              href="mailto:support@trendvero.shop"
              className="bg-[#eef4ff] text-[#2563eb] px-5 py-3 rounded-full text-[14px] font-semibold border border-[#cfe0ff]"
            >
              support@trendvero.shop
            </a>
          </div>
        </div>

        {/* Policy Grid */}
        <div className="bg-white border border-[#dfe7f5] rounded-[22px] shadow-sm p-5 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {policies.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="group bg-[#fbfdff] border border-[#dfe7f5] rounded-[18px] p-[10px] flex items-center gap-4 text-left hover:bg-[#eef4ff] hover:border-[#2563eb] hover:shadow-md transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-[#eef4ff] text-[#2563eb] flex items-center justify-center text-[22px] group-hover:bg-[#2563eb] group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>

                <span className="text-[14px] font-semibold text-[#0f172a]">
                  {item.title}
                </span>
              </button>
            ))}

          </div>

          {/* Bottom Trust Box */}
          <div className="mt-6 bg-gradient-to-r from-[#e8f0ff] to-[#dbeafe] rounded-[20px] px-5 py-5 text-center border border-[#cfe0ff]">
            <h3 className="text-[18px] font-bold text-[#2563eb]">
              Secure Payments
            </h3>
            <p className="text-[14px] text-[#64748b] mt-1">
              Safe checkout, order support, and trusted customer assistance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PolicySupport;