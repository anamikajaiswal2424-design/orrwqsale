import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductOptions from './ProductOptions';
import Data, { getProductVariants } from '../Data';

it('shows catalogue storage and price and switches the complete variant', () => {
  const variants = getProductVariants(Data[0]);
  const onStorageChange = jest.fn();
  const onColorChange = jest.fn();
  const { rerender } = render(<ProductOptions product={Data[0]} variants={variants} onStorageChange={onStorageChange} onColorChange={onColorChange} />);
  expect(screen.getByRole('heading')).toHaveTextContent('512 GB');
  expect(screen.queryByText(/179,900|254,900|Protect Promise/)).not.toBeInTheDocument();
  const black = variants.find(item => item.storage === '256 GB');
  fireEvent.click(screen.getByRole('button', { name: /256 GB/ }));
  expect(onStorageChange).toHaveBeenCalledWith(black);
  rerender(<ProductOptions product={black} variants={variants} onStorageChange={onStorageChange} onColorChange={onColorChange} />);
  expect(screen.getByRole('heading')).toHaveTextContent(black.color);
  expect(screen.getByRole('heading')).toHaveTextContent('256 GB');
  expect(screen.getByRole('button', { name: black.color })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: variants[0].color }));
  expect(onColorChange).toHaveBeenCalledWith(variants[0]);
});

it('uses actual size for products without storage and supports unavailable variants', () => {
  const product = Data.find(item => !item.storage && item.size);
  const { rerender } = render(<ProductOptions product={product} variants={getProductVariants(product)} />);
  expect(screen.queryByRole('button', { name: /256 GB/ })).not.toBeInTheDocument();
  expect(screen.getByRole('heading')).toHaveTextContent(product.size);
  const unavailable = { ...product, available: false };
  rerender(<ProductOptions product={unavailable} variants={[unavailable]} />);
  expect(screen.getByRole('button', { name: /Out of stock/ })).toBeDisabled();
});
