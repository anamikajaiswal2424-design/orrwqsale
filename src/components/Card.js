import React, { useCallback, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'




import { useMemo } from "react";


import Data from '../Data';











const Card = ({ data, cart }) => {

  const PRODUCTS_PER_PAGE = 30;

  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const [product, setProduct] = useState([])



  const navigate = useNavigate()



  useEffect(() => {

    if (data && data.length > 0) {

      setProduct(data.slice(0, visibleCount));

    }

  }, [data, visibleCount]);



  const loadMoreProducts = useCallback(() => {

    if (visibleCount < data.length) {

      setVisibleCount(prev => prev + PRODUCTS_PER_PAGE);

    }

  }, [visibleCount, data.length]);



  const handleScroll = useCallback(() => {

    const scrollTop = document.documentElement.scrollTop;

    const scrollHeight = document.documentElement.scrollHeight;

    const clientHeight = document.documentElement.clientHeight;



    if (scrollTop + clientHeight >= scrollHeight - 200) {

      loadMoreProducts();

    }

  }, [loadMoreProducts]);



  useEffect(() => {

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, [handleScroll]);





  const openProduct = (i) => {

    const selectedProduct = product[i];

    const dataIndex = data.findIndex((item) => item.id === selectedProduct.id);

    if (cart) {

      localStorage.setItem("second", dataIndex >= 0 ? dataIndex : i)

    } else {

      // Data.js now contains only the 19 main products; variants are nested.

      const realIndex = Data.findIndex((item) => item.id === selectedProduct.id);

      localStorage.setItem("id", realIndex >= 0 ? realIndex : i)

    }

    const selectedRating = productRatings[i];



navigate(
  `/product-details?id=${selectedProduct.id}&rating=${selectedRating?.rating}&reviews=${selectedRating?.reviews}`,
  { replace: true }
);



    // navigate("/product-details", { replace: true })

    // window.scroll(0, 0)

  }



  const productRatings = useMemo(() => {

    return data?.map(() => ({

      rating: (Math.random() * (5 - 4.5) + 4.5).toFixed(1),

reviews: Math.floor(Math.random() * (10000 - 500 + 1)) + 500,

    }));

  }, [data]);



  const ratingsList = [

    4.0, 4.1, 4.2, 4.3, 4.4,

    4.5, 4.6, 4.7, 4.8, 4.9,

    5.0

  ];


  // Card cart quantity state: Add to Cart -> - qty +
  const [cardCartQty, setCardCartQty] = useState({});

  const getCardStoredCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart_items") || "[]");
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      return [];
    }
  };

  const getCardProductId = (item) => String(item?.id ?? item?.md5_id ?? "");

  const syncCardCartQty = (cart) => {
    const quantities = {};
    cart.forEach((cartItem) => {
      const id = getCardProductId(cartItem);
      if (id) quantities[id] = Number(cartItem.qty) || 1;
    });
    setCardCartQty(quantities);
  };

  useEffect(() => {
    const refresh = () => syncCardCartQty(getCardStoredCart());
    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener("cartUpdated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("cartUpdated", refresh);
    };
  }, []);

  const addCardToCart = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    const id = getCardProductId(item);
    const cart = getCardStoredCart();

    let existing = cart.find(
      (cartItem) => getCardProductId(cartItem) === id
    );

    if (existing) {
      existing.qty = Math.min(99, (Number(existing.qty) || 1) + 1);
    } else {
      existing = {
        ...item,
        md5_id: item.md5_id || item.id,
        name: item.name || item.title,
        img1: item.img1 || item.image?.[0] || "",
        selling_price: Number(item.selling_price ?? item.price) || 0,
        mrp: Number(item.mrp ?? item.cancelprice) || 0,
        color: item.color || "",
        size: item.size || "",
        storage: item.storage || "",
        qty: 1,
      };
      cart.push(existing);
    }

    localStorage.setItem("cart_items", JSON.stringify(cart));
    syncCardCartQty(cart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const changeCardCartQty = (event, item, change) => {
    event.preventDefault();
    event.stopPropagation();

    const id = getCardProductId(item);
    let cart = getCardStoredCart();

    const existing = cart.find(
      (cartItem) => getCardProductId(cartItem) === id
    );

    if (!existing) {
      if (change > 0) addCardToCart(event, item);
      return;
    }

    const nextQty = Math.max(
      0,
      Math.min(99, (Number(existing.qty) || 1) + change)
    );

    if (nextQty === 0) {
      cart = cart.filter(
        (cartItem) => getCardProductId(cartItem) !== id
      );
    } else {
      existing.qty = nextQty;
    }

    localStorage.setItem("cart_items", JSON.stringify(cart));
    syncCardCartQty(cart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const randomRatings = useMemo(() => {

    return product.map(() =>

      ratingsList[Math.floor(Math.random() * ratingsList.length)]

    );

  }, [product]);







  return (
    <div className="grid grid-cols-2 bg-white">
      {product &&
        product.map((item, index) => {
          const mrp = Number(item.cancelprice) || 0;
          const sellingPrice = Number(item.price) || 0;
          const discount =
            mrp > 0
              ? Math.max(0, 100 - Math.round((sellingPrice * 100) / mrp))
              : 0;

          const rating = Number(randomRatings[index] || 4.5).toFixed(1);

          const seed = String(item.id ?? index)
            .split("")
            .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

          const messages = [
            "Lowest Price in 30 days",
            "Limited Time Deal",
            "Bank Offer",
            "Last 1 left",
            "Saver Deal",
          ];
          const productMessage = messages[seed % messages.length];

          const today = new Date();
          const daysAhead = seed % 5;
          let deliveryMessage = "Free delivery";
          if (daysAhead === 1) {
            deliveryMessage = "Free delivery by Tomorrow";
          } else if (daysAhead > 1) {
            const deliveryDate = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() + daysAhead
            );
            deliveryMessage = `Free delivery by ${deliveryDate.toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            )}`;
          }

          return (
            <article
              key={item.id}
              onClick={() => openProduct(index)}
              className="border border-gray-200 bg-white relative cursor-pointer"
              style={{
                padding: "4px",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <div
                className="relative flex items-center justify-center"
                style={{
                  height: "155px",
                  width: "100%",
                  background: "#fff",
                }}
              >
                <img
                  src={item.image?.[0]}
                  alt={item.title || "Product"}
                  loading={index < 2 ? "eager" : "lazy"}
                  className="w-full h-full object-contain"
                  style={index === 2 ? { height: "80%" } : undefined}
                />

                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: "3px",
                    top: "3px",
                    width: "25px",
                    height: "25px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                >
                  <svg width="23" height="23" viewBox="0 0 256 256">
                    <path fill="none" d="M0 0h256v256H0z" />
                    <path
                      d="M128 216S28 160 28 92a52 52 0 0 1 100-20 52 52 0 0 1 100 20c0 68-100 124-100 124Z"
                      fill="#fff"
                      stroke="#B8BBBF"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <div style={{ padding: "5px 0 7px" }}>
                <div
                  style={{
                    color: "#555",
                    fontSize: "12px",
                    lineHeight: "17px",
                    height: "17px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    marginBottom: "4px",
                    justifycontent: "left",
                    alignItems: "left",
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                    fontSize: "12px",
                    lineHeight: "18px",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      color: "#008C00",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {discount}% off
                  </span>

                  <span
                    style={{
                      color: "#777",
                      textDecoration: "line-through",
                      fontSize: "11px",
                    }}
                  >
                    ₹{mrp.toFixed(2)}
                  </span>

                  <span
                    style={{
                      color: "#111",
                      fontWeight: 700,
                      fontSize: "12px",
                    }}
                  >
                    ₹{sellingPrice.toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap",
                    fontSize: "11px",
                    lineHeight: "18px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      color: "#0066c0",
                      border: "1px solid #0066c0",
                      borderRadius: "9px",
                      padding: "0 4px",
                      fontWeight: 800,
                      fontStyle: "italic",
                      lineHeight: "16px",
                    }}
                  >
                    WOW!
                  </span>

                  <strong style={{ fontSize: "11px" }}>
                    ₹{sellingPrice.toFixed(2)}
                  </strong>
                  <span>with offer</span>
                </div>

                <div
                  style={{
                    color:
                      productMessage === "Limited Time Deal"
                        ? "#008C00"
                        : "#008C00",
                    fontSize: "11px",
                    lineHeight: "17px",
                    height: "17px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    marginBottom: "3px",
                  }}
                >
                  {productMessage}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "3px",
                    height: "18px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    aria-label={`${rating} out of 5 stars`}
                    style={{
                      color: "#008C00",
                      fontSize: "15px",
                      letterSpacing: "-2px",
                      whiteSpace: "nowrap",
                      lineHeight: "18px",
                    }}
                  >
                    ★★★★★
                  </span>

                  <img
                    src="https://rukminim2.flixcart.com/www/60/16/promos/25/06/2024/71af54bd-9160-41ff-81cc-c55e534dedeb.png"
                    alt="Assured"
                    style={{
                      height: "15px",
                      maxWidth: "65px",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div
                  style={{
                    color: "#222",
                    fontSize: "11px",
                    lineHeight: "16px",
                    height: "16px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    marginBottom: "7px",
                  }}
                >
                  {deliveryMessage}
                </div>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
  }}
  onClick={(event) => event.stopPropagation()}
>
  {Number(cardCartQty[getCardProductId(item)] || 0) > 0 ? (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        minHeight: "38px",

        display: "grid",
        gridTemplateColumns:
          "minmax(28px, .72fr) minmax(24px, 1fr) minmax(28px, .72fr)",

        overflow: "hidden",

        border: "1px solid #2874f0",
        borderRadius: "7px",

        background: "#fff",
        color: "#1457b8",

        boxSizing: "border-box",
      }}
      aria-label="Product quantity"
    >
      {/* MINUS */}
      <button
        type="button"
        onClick={(event) =>
          changeCardCartQty(event, item, -1)
        }
        aria-label="Decrease quantity"
        style={{
          minWidth: 0,
          minHeight: "36px",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          margin: 0,
          padding: 0,

          boxSizing: "border-box",

          border: 0,
          background: "#edf5ff",

          color: "#1457b8",

             fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1,

          cursor: "pointer",
        }}
      >
        −
      </button>

      {/* QUANTITY */}
      <span
        aria-live="polite"
        style={{
          minWidth: 0,
          minHeight: "36px",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          margin: 0,
          padding: 0,

          boxSizing: "border-box",

          background: "#fff",

          color: "#1457b8",

          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {cardCartQty[getCardProductId(item)]}
      </span>

      {/* PLUS */}
      <button
        type="button"
        onClick={(event) =>
          changeCardCartQty(event, item, 1)
        }
        aria-label="Increase quantity"
        style={{
          minWidth: 0,
          minHeight: "36px",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          margin: 0,
          padding: 0,

          boxSizing: "border-box",

          border: 0,
          background: "#edf5ff",

          color: "#1457b8",

          fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1,

          cursor: "pointer",
        }}
      >
        +
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={(event) =>
        addCardToCart(event, item)
      }
      style={{
        width: "100%",
        minHeight: "38px",

        border: "1px solid #2874f0",
        borderRadius: "7px",

        background: "#fff",
        color: "#1457b8",

        fontSize: "12px",
        fontWeight: 600,

        cursor: "pointer",
        boxSizing: "border-box",
      }}
    >
      Add to Cart
    </button>
  )}

  {/* BUY NOW - ISKO SAME RAKHA HAI */}
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      openProduct(index);
    }}
    style={{
      minHeight: "38px",
      border: "1px solid #2874f0",
      borderRadius: "7px",
      background: "#2874f0",
      color: "#fff",
      fontSize: "12px",
      fontWeight: 600,
      cursor: "pointer",
      boxSizing: "border-box",
    }}
  >
    Buy Now
  </button>
</div>
              </div>
            </article>
          );
        })}
    </div>
  );
};

export default Card;
