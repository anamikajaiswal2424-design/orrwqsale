// import React from "react";
// import Menu from "../assets/Mneu.svg"
// import Logo from "../assets/logofk.webp"
// import User from "../assets/Login.svg"
// import Search from "../assets/Search Icon.svg"
// import Cart from "../assets/Cart.svg"
// import { Link } from "react-router-dom";


// export default function Header() {

//   return (
//     <>
//     <div className="w-full bg-[#2874f0] pb-[10px]">
//       {/* Header */}
//       <header className="flex justify-between items-center p-3 ">
//         <Link to="/" className="flex items-center">
//           {/* <img
//             alt="menu"
//             src={Menu}
//             className="w-6 h-6 md:w-8 md:h-8"
//           /> */}
//           <svg xmlns="http://www.w3.org/2000/svg" fill="#FFF" height="24" viewBox="0 0 24 24" width="24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
//           <img
//             alt="logo"
//             src={Logo}
//             className="h-7 ml-5"
//           />
//         </Link>

//         <div className="flex items-center ">
//           <img
//             alt="search"
//             src={Search}
//             className="w-5 h-5 md:w-6 md:h-6"
//           />
//           <a href="#">
//             <img
//               alt="cart"
//               src={Cart}
//               className="w-6 h-6 ml-3"
//             />
//           </a>
//         </div>
//       </header>

//       {/* Search bar */}
//       <div className="px-3">
//         <input
//           type="text"
//           placeholder="Search for Products, Brands and More"
//           className="header-input w-full border rounded px-4 py-2 text-sm md:text-base outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>
//     </div>


    
//     </>
//   );
// }



import React, { useState } from "react";
import "../App.css";
import Banner from "../images/homepage-sale-banner_new.webp";

const HomeFkShell = () => {
  const [brandMall, setBrandMall] = useState(false);
  const [search, setSearch] = useState("");

  const handleClear = () => {
    setSearch("");
  };

  return (
    <section
      className="home-fk-shell"
      aria-label="Homepage offers"
    >
      {/* ================= TABS ================= */}
      <div className="home-fk-tabs">

        <a
          className="home-fk-tab primary fk-custom-tab"
          href="/"
          aria-label="Flipkart home"
        >
          <img
            className="fk-approved-single-logo"
            src="https://fk.gamer.gd/assets/images/flipkart_logo_single_transparent_logo.png"
            alt="Flipkart"
          />
        </a>

        <a
          className="home-fk-tab"
          href="#"
          onClick={(e) => e.preventDefault()}
          aria-label="Travel"
        >
          <span className="tab-icon">✈️</span>
          <span>Travel</span>
        </a>

        <a
          className="home-fk-tab"
          href="#"
          onClick={(e) => e.preventDefault()}
          aria-label="Pay"
        >
          <span className="tab-icon">💳</span>
          <span>Pay</span>
        </a>

      </div>


      {/* ================= LOCATION ================= */}
      <div className="home-location">

        <i
          className="fa-solid fa-location-dot"
          aria-hidden="true"
        ></i>

        <span>
          Location not set
        </span>

        <a
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          Select delivery location&nbsp;›
        </a>

      </div>


      {/* ================= SEARCH ROW ================= */}
      <div className="home-search-row">

        {/* Brand Mall */}
        <div>

          <div className="home-brand-label">
            Brand Mall
          </div>

          <div className="home-brand-control">

            <label
              className="home-toggle"
              aria-label="Brand Mall toggle"
            >

              <input
                type="checkbox"
                id="brandMallToggle"
                checked={brandMall}
                onChange={(e) => setBrandMall(e.target.checked)}
              />

              <span className="home-toggle-track"></span>

            </label>

            <span id="brandMallText">
              {brandMall ? "ON" : "OFF"}
            </span>

          </div>

        </div>


        {/* Search */}
        <label className="home-search-box">

          <i
            className="fa-solid fa-magnifying-glass"
            aria-hidden="true"
          ></i>

          <input
            id="search-input"
            type="search"
            placeholder="Search mobiles, shoes, products..."
            aria-label="Search products"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            id="clear-button"
            aria-label="Clear search"
            onClick={handleClear}
            style={{
              visibility: search ? "visible" : "hidden",
              border: 0,
              background: "transparent",
              fontSize: "22px",
              lineHeight: 1,
              padding: "0 2px",
              color: "#777",
              cursor: "pointer",
            }}
          >
            ×
          </button>

        </label>

      </div>


      {/* ================= MAIN BANNER ================= */}
      <a
        className="home-main-banner"
        href="#products"
        aria-label="Shop end of season sale"
      >

        <img
          src={Banner}
          alt="End of season sale, 60 to 90 percent off"
          loading="eager"
        />

      </a>

    </section>
  );
};

export default HomeFkShell;