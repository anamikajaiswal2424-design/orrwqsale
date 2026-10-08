import React from 'react';
import { getBaseTitle, getProductColor } from '../Data';
import './ProductOptions.css';

const rupees = (value) =>
  `₹${Number(value).toLocaleString('en-IN')}`;

export default function ProductOptions({
  product,
  variants = [],
  onColorChange,
  onStorageChange,
}) {
  if (!product) return null;

  const choices = variants.length ? variants : [product];
  // Each entry is a real catalogue variant, including its own image and price.
  const colour = getProductColor(product);
  const orderedChoices = [...choices.filter((item) => getProductColor(item) === colour),
    ...choices.filter((item) => getProductColor(item) !== colour)];
  const options = orderedChoices.map((variant) => ({
    label: variant.storage || variant.size || '',
    price: variant.price,
    available: variant.available !== false,
    variant,
  })).filter((option, index, all) => option.label &&
    all.findIndex((other) => other.label === option.label) === index);
  const selectedLabel = product.storage || product.size || '';
  const selected = options.find((option) => option.label === selectedLabel);
  const colours = choices.filter((variant, index, all) =>
    all.findIndex((other) => getProductColor(other) === getProductColor(variant)) === index);
  const protectFee = product.protectFee;

  const title = getBaseTitle(product.title);

  const selectStorage = (option) => {
    if (option.available === false) return;

    const match = choices.find((item) =>
      (item.storage || item.size || '') === option.label &&
      getProductColor(item) === colour && item.available !== false);
    onStorageChange?.(match || option.variant);
  };

  return (
    <section className="po-section">
      <p className="po-label">
        <b>Selected Color:</b> {colour}
      </p>

      <div className="po-colours" aria-label="Select colour">
        {colours.map((variant) => {
          const active =
            getProductColor(variant) === colour;

          return (
            <button
              type="button"
              key={variant.id}
              className={`po-colour ${
                active ? 'po-selected' : ''
              }`}
              aria-label={getProductColor(variant)}
              aria-pressed={active}
              onClick={() => onColorChange?.(choices.find((item) =>
                getProductColor(item) === getProductColor(variant) &&
                (item.storage || item.size || '') === selectedLabel) || variant)}
            >
              <img
                src={variant.image?.[0]}
                alt={getProductColor(variant)}
              />
            </button>
          );
        })}
      </div>

      <p className="po-label po-storage-label">
        <b>Variant:</b> {selectedLabel || 'Standard'}
      </p>

      <div className="po-storage" aria-label="Select storage">
        {options.map((option) => (
          <button
            type="button"
            key={option.label}
            disabled={option.available === false}
            aria-pressed={selected?.label === option.label}
            className={`po-storage-card ${
              selected?.label === option.label
                ? 'po-selected'
                : ''
            }`}
            onClick={() => selectStorage(option)}
          >
            <span className="po-capacity">
              {option.label}
            </span>

            <span
              className={
                option.available === false
                  ? 'po-unavailable'
                  : 'po-option-price'
              }
            >
              {option.available === false
                ? 'Out of stock'
                : rupees(option.price)}
            </span>
          </button>
        ))}
      </div>

      <h1 className="po-title">
        {title} ({colour}
        {selectedLabel ? `, ${selectedLabel}` : ''})
      </h1>

      {product.price != null && (
        <p className="po-main-price">
          {rupees(product.price)}
        </p>
      )}

      {protectFee != null && <p className="po-fee">
        +{rupees(protectFee)} Protect Promise Fee
        <span aria-hidden="true">›</span>
      </p>}
    </section>
  );
}