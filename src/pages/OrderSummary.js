import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import Back from '../assets/Back.svg';
import './OrderSummary.css';

const readCart = () => {
  try {
    const value = JSON.parse(
      localStorage.getItem('checkout_cart') ||
        localStorage.getItem('cart_items') ||
        '[]',
    );
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const itemKey = (item) =>
  `${String(item.md5_id ?? item.id ?? '')}|${item.color || ''}|${
    item.size || ''
  }|${item.storage || ''}`;

const itemName = (item) => item.name || item.title || 'Product';

const itemImage = (item) => {
  if (item.img1) return item.img1;
  if (Array.isArray(item.image)) return item.image[0] || '';
  return item.image || item.img || '';
};

const money = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const moneyFixed = (value) =>
  `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OrderSummary() {
  const navigate = useNavigate();
  const [items, setItems] = useState(readCart);

  const save = (next) => {
    setItems(next);
    localStorage.setItem('cart_items', JSON.stringify(next));
    localStorage.setItem('checkout_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const changeQuantity = (item, difference) => {
    const next = items
      .map((current) =>
        itemKey(current) === itemKey(item)
          ? {
              ...current,
              qty: Math.max(
                0,
                Math.min(99, (Number(current.qty) || 1) + difference),
              ),
            }
          : current,
      )
      .filter((current) => (Number(current.qty) || 0) > 0);

    save(next);
  };

  const totals = useMemo(
    () =>
      items.reduce(
        (result, item) => {
          const quantity = Number(item.qty) || 1;
          const price = Number(item.selling_price ?? item.price) || 0;
          const mrp = Number(item.mrp ?? item.cancelprice ?? price) || price;

          result.pay += price * quantity;
          result.mrp += mrp * quantity;
          result.qty += quantity;
          return result;
        },
        { pay: 0, mrp: 0, qty: 0 },
      ),
    [items],
  );

  const goPayment = () => {
    localStorage.setItem('checkout_total', String(totals.pay));
    localStorage.setItem('checkout_cart', JSON.stringify(items));
    navigate('/payment');
  };

  const customerName = localStorage.getItem('fname') || 'Select delivery address';
  const deliveryAddress = localStorage.getItem('address') || '';
  const mobile = localStorage.getItem('mobile') || '';

  return (
    <main className="summary-page">
      <header className="summary-header">
        <Link to="/cart" aria-label="Back to cart">
          <img src={Back} alt="" />
        </Link>
        <h1>ORDER CONFIRMATION</h1>
      </header>

      <ol className="summary-steps" aria-label="Checkout progress">
        {['Cart', 'Address', 'Confirm', 'Payment', 'Summary'].map((label, index) => (
          <li
            key={label}
            className={index < 2 ? 'is-complete' : index === 2 ? 'is-current' : ''}
            aria-current={index === 2 ? 'step' : undefined}
          >
            <span>{index < 2 ? '✓' : index + 1}</span>
            <small>{label}</small>
          </li>
        ))}
      </ol>

      <section className="summary-review" aria-labelledby="review-heading">
        <h2 id="review-heading">Review your items</h2>

        {!items.length && (
          <div className="summary-empty">
            <h3>Your cart is empty</h3>
            <p>Add products to continue with your order.</p>
            <Link to="/">Continue shopping</Link>
          </div>
        )}

        {items.map((item) => {
          const price = Number(item.selling_price ?? item.price) || 0;
          const mrp = Number(item.mrp ?? item.cancelprice ?? price) || price;
          const quantity = Number(item.qty) || 1;
          const variant = [item.color, item.storage, item.size]
            .filter(Boolean)
            .join(' - ');

          return (
            <article className="summary-product" key={itemKey(item)}>
              <div className="summary-image">
                <img src={itemImage(item)} alt={itemName(item)} />
              </div>

              <div className="summary-product-info">
                <h3>{itemName(item)}</h3>
                <button
                  type="button"
                  className="summary-remove"
                  aria-label={`Remove ${itemName(item)}`}
                  onClick={() =>
                    save(items.filter((current) => itemKey(current) !== itemKey(item)))
                  }
                >
                  <FiTrash2 aria-hidden="true" />
                </button>

                <div className="summary-product-price">
                  <strong>{money(price)}</strong>
                  {mrp > price && <del>{money(mrp)}</del>}
                </div>

                <div className="summary-product-bottom">
                  <p className="summary-variant">Size : {variant || 'Standard'}</p>
                  <div className="summary-quantity" aria-label="Quantity selector">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${itemName(item)}`}
                      onClick={() => changeQuantity(item, -1)}
                    >
                      −
                    </button>
                    <span aria-live="polite">{String(quantity).padStart(2, '0')}</span>
                    <button
                      type="button"
                      disabled={quantity >= 99}
                      aria-label={`Increase quantity of ${itemName(item)}`}
                      onClick={() => changeQuantity(item, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="summary-address" aria-labelledby="address-heading">
        <h2 id="address-heading">Delivery Address</h2>
        <p className="summary-customer-name">{customerName}</p>
        {deliveryAddress && <p>{deliveryAddress}</p>}
        {mobile && <p>Mobile: {mobile}</p>}
      </section>

      <section
        className="summary-prices"
        id="summary-price-details"
        aria-labelledby="price-heading"
      >
        <h2 id="price-heading">Price Details</h2>
        <dl>
          <div>
            <dt>Product Total</dt>
            <dd>{moneyFixed(totals.pay)}</dd>
          </div>
          <div>
            <dt>Delivery Charges</dt>
            <dd className="summary-green">FREE</dd>
          </div>
          <div className="summary-total">
            <dt>Order Total</dt>
            <dd>{moneyFixed(totals.pay)}</dd>
          </div>
        </dl>
      </section>

      <footer className="summary-footer">
        <div>
          <strong>{moneyFixed(totals.pay)}</strong>
          <a href="#summary-price-details">Final Order Amount</a>
        </div>
        <button type="button" disabled={!items.length} onClick={goPayment}>
          Purchase
        </button>
      </footer>
    </main>
  );
}
