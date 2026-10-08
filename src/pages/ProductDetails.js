import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaForward } from 'react-icons/fa';
import ProductOptions from './ProductOptions';
import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiSearch,
  FiShare2,
  FiTruck,
  FiShoppingCart,
} from 'react-icons/fi';

import Data, {
  getBaseTitle,
  getProductColor,
  getProductVariants,
} from '../Data';

import Trusted from '../assets/plue-fassured.png';

import 'swiper/css';
import 'swiper/css/pagination';
import './ProductDetails.css';

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

const discount = (product) => {
  if (Number(product.cancelprice) <= 0) return 0;

  return Math.max(
    0,
    Math.round(
      (1 - Number(product.price) / Number(product.cancelprice)) * 100
    )
  );
};

export default function ProductDetails({ cart = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const id =
    params.get('id') ||
    location.pathname.split('/').filter(Boolean).pop();

  const rating = params.get('rating') || params.get('e');
  const reviews = params.get('reviews') || params.get('e1');

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [slide, setSlide] = useState(0);
  const [count, setCount] = useState(() => readArray('cart_items').length);
  const [liked, setLiked] = useState(false);
  const [notice, setNotice] = useState('');

  const swiper = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(cart ? 'second' : 'id');

    const selected =
      (!cart &&
        Data.flatMap((item) => [item, ...getProductVariants(item)]).find((item) => String(item.id) === String(id))) ||
      (saved !== null && Data[Number(saved)]) ||
      Data[0];

    setProduct(selected || null);
    setVariants(selected ? getProductVariants(Data.find((item) => String(item.id) === String(selected.id) || getProductVariants(item).some((variant) => String(variant.id) === String(selected.id))) || selected) : []);
    setSlide(0);
    setLiked(false);

    swiper.current?.slideTo(0, 0);
    window.scrollTo(0, 0);
  }, [id, cart]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const notify = (message) => {
    setNotice(message);
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const saveSelection = (item) => {
    const index = Data.findIndex(
      (entry) => String(entry.id) === String(item.id) || getProductVariants(entry).some((variant) => String(variant.id) === String(item.id))
    );

    if (index < 0) {
      notify('Product is unavailable');
      return -1;
    }

    localStorage.setItem('id', String(index));
    localStorage.setItem(
      'size',
      item.size || '17.53 cm (6.9 inch)'
    );

    return index;
  };

  const addToCart = (item) => {
    const index = saveSelection(item);
    if (index < 0) return;

    const items = readArray('cart_items');
    const existing = items.find((entry) => String(entry.id) === String(item.id));
    if (existing) existing.qty = (Number(existing.qty) || 1) + 1;
    else items.push({ ...item, qty: 1 });
    localStorage.setItem('cart_items', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
    setCount(items.length);
    notify('Added to Cart');
  };

  const selectVariant = (item) => {
    setProduct(item);
    setSlide(0);
    swiper.current?.slideTo(0, 0);
  };

  const share = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('id', String(product.id));

      if (navigator.share) {
        await navigator.share({
          title: product.title,
          url: url.href,
        });
      } else {
        await navigator.clipboard.writeText(url.href);
        notify('Product link copied');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        notify('Unable to share this product');
      }
    }
  };

  if (!product) {
    return <div className="pd-empty">No product available.</div>;
  }

  const images = Array.isArray(product.image)
    ? product.image
    : [];

  const suggested = Data.filter(
    (item) => String(item.id) !== String(product.id)
  ).slice(0, 20);

  const delivery = product.deliveryDate || '8 Oct, Thursday';
  const mainProduct = Data.find((item) => String(item.id) === String(product.id) ||
    getProductVariants(item).some((variant) => String(variant.id) === String(product.id)));
  const rawDescription = String(product.desc || '');
  const description = rawDescription.includes('<') && !rawDescription.trim().endsWith('>')
    ? mainProduct?.desc || ''
    : rawDescription || mainProduct?.desc || '';

  return (
    <main className="pd-page">
      {/* Header */}
      <header className="pd-header">
        <button
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
          <FiChevronLeft />
        </button>

        <a
          className="pd-brand"
          href="/"
          onClick={(event) => {
            event.preventDefault();
            navigate('/');
          }}
        >
          Flipkart
          <small>
            Explore <span>Plus✦</span>
          </small>
        </a>

        <button
          className="pd-search"
          aria-label="Search products"
          onClick={() => navigate('/')}
        >
          <FiSearch />
        </button>

        <button
          className="pd-cart"
          aria-label={`Cart with ${count} products`}
          onClick={() => navigate('/cart')}
        >
          <FiShoppingCart />

          {count > 0 && <span>{count}</span>}
        </button>
      </header>

      {/* Product image slider */}
      <section
        className="pd-gallery"
        aria-label="Product images"
      >
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          onSwiper={(instance) => {
            swiper.current = instance;
          }}
          onSlideChange={(instance) => {
            setSlide(instance.activeIndex);
          }}
        >
          {images.map((src, index) => (
            <SwiperSlide key={`${product.id}-${index}`}>
              <img
                src={src}
                alt={`${product.title}, view ${index + 1}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <span className="pd-counter">
          {images.length ? slide + 1 : 0}/{images.length}
        </span>

        <div className="pd-gallery-actions">
          <button
            aria-label="Favourite product"
            aria-pressed={liked}
            className={liked ? 'is-liked' : ''}
            onClick={() => setLiked(!liked)}
          >
            <FiHeart />
          </button>

          <button
            aria-label="Share product"
            onClick={share}
          >
            <FiShare2 />
          </button>
        </div>
      </section>

      {/* Order activity from product data */}
      {product.orderCount && (
        <div className="pd-orders">
          <span>↗</span>

          <p>
            <b>{product.orderCount}</b> people ordered this in
            the last {product.orderDays || 11} days
          </p>
        </div>
      )}


<ProductOptions
  key={product.id}
  product={product}
  variants={variants}
  onColorChange={selectVariant}
  onStorageChange={selectVariant}
/>


      {/* Colour variants */}
      {/* {variants.length > 1 && (
        <section className="pd-variants">
          <h2>{variants.length} Similar Products</h2>

          <div className="pd-variant-list">
            {variants.map((item) => {
              const selected =
                String(item.id) === String(product.id);

              return (
                <button
                  key={item.id}
                  aria-pressed={selected}
                  className={selected ? 'selected' : ''}
                  onClick={() => selectVariant(item)}
                >
                  <img
                    src={item.image?.[0]}
                    alt=""
                  />

                  <span>{getProductColor(item)}</span>
                </button>
              );
            })}
          </div>
        </section>
      )} */}

      {/* Product title, rating and price */}
      {/* <section className="pd-summary">
        <h1>{getBaseTitle(product.title)}</h1>

        <p className="pd-colour">
          <b>Colour:</b> {getProductColor(product)}
        </p>

        <div className="pd-rating">
          <span
            className="pd-stars"
            aria-label={`${
              rating || product.rating || 5
            } out of 5 stars`}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar key={index} />
            ))}
          </span>

          <span>
            Excellent
            {(reviews || product.reviews) &&
              ` • ${reviews || product.reviews} ratings`}
          </span>

          <img src={Trusted} alt="Assured" />
        </div>

        <div className="pd-deal">Limited Time Deal</div>

        <div className="pd-price">
          <strong>{money(product.price)}</strong>
          <del>{money(product.cancelprice)}</del>
          <span>{discount(product)}% off</span>
        </div>

        <h2 className="pd-size-title">Select Size</h2>

        <button
          className="pd-size"
          aria-pressed="true"
          onClick={() => saveSelection(product)}
        >
          {product.size || '17.53 cm (6.9 inch)'}
        </button>
      </section> */}

      {/* Delivery */}
      <section className="pd-delivery">
        <FiTruck />

        <div>
          <p>
            <b>FREE Delivery</b> <del>₹64</del>
          </p>

          <strong>Delivery by • {delivery}</strong>
        </div>

        <FiChevronRight className="pd-delivery-arrow" />
      </section>

      {/* Benefits */}
      <section className="pd-trust">
        <div>
          <span className="pd-replacement">▣</span>
          <p>7 days Replacement</p>
        </div>

        <div>
          <span className="pd-cash">₹</span>
          <p>No Cash On Delivery</p>
        </div>

        <div>
          <img src={Trusted} alt="Assured" />
          <p>Plus (F-Assured)</p>
        </div>
      </section>

      {/* Description */}
      <section className="pd-details">
        <h2>Product Details</h2>

        {description && (
          <div
            className="pd-description"
            // Catalogue descriptions are local HTML from Data.js.
            dangerouslySetInnerHTML={{ __html: String(description) }}
          />
        )}
      </section>

      {/* Suggested products */}
      <section className="pd-suggestions">
        <h2>Suggested Products</h2>

        <div className="pd-grid">
          {suggested.map((item) => (
            <article className="pd-card" key={item.id}>
              <button
                className="pd-card-link"
                onClick={() =>
                  navigate(
                    // `/product-details/${item.id}?id=${encodeURIComponent(
                    //   item.id
                    // )}`

                    `/product-details?id=${item.id}&rating=${item.Rating}&reviews=${item.Reviews}`,
  { replace: true }


                  )
                }
              >
                
                
                <img
                  src={item.image?.[0]}
                  alt={getBaseTitle(item.title)}
                />

                <span>{getBaseTitle(item.title)}</span>
              </button>

              <p className="pd-card-discount">
                <span>{discount(item)}% off</span>{' '}
                <del>{money(item.cancelprice)}</del>
              </p>

              <strong>{money(item.price)}</strong>

              {item.offer && (
                <p className="pd-card-offer">{item.offer}</p>
              )}

              <p className="pd-card-delivery">
                Free delivery by {item.deliveryDate || delivery}
              </p>

              <button
                className="pd-card-add"
                onClick={() => addToCart(item)}
              >
                Add to Cart
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Fixed bottom buttons */}
      <footer className="pd-actions">
        <button onClick={() => addToCart(product)}>
          <FaShoppingCart />
          Add to Cart
        </button>

        <button
          className="pd-buy"
          onClick={() => {
            if (saveSelection(product) >= 0) {
              localStorage.setItem('checkout_cart', JSON.stringify([{ ...product, qty: 1 }]));
              localStorage.setItem('checkout_total', String(product.price));
              navigate('/address');
            }
          }}
        >
          <FaForward />
          Buy Now
        </button>
      </footer>

      {notice && (
        <div className="pd-toast" role="status">
          {notice}
        </div>
      )}
    </main>
  );
}