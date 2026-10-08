import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const readCart = () => {
  try {
    const value = JSON.parse(localStorage.getItem("cart_items") || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
};

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState(readCart);

  const save = (next) => {
    localStorage.setItem("cart_items", JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  useEffect(() => {
    const refresh = () => setItems(readCart());
    window.addEventListener("cartUpdated", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("cartUpdated", refresh); window.removeEventListener("storage", refresh); };
  }, []);

  const keyOf = (x) => String(x.md5_id ?? x.id ?? "") + "|" + (x.color || "") + "|" + (x.size || "") + "|" + (x.storage || "");
  const changeQty = (item, delta) => {
    const key = keyOf(item);
   let next = items.map((x) =>
  keyOf(x) === key
    ? {
        ...x,
        qty: Math.max(
          0,
          Math.min(99, (Number(x.qty) || 1) + delta)
        ),
      }
    : x
);

next = next.filter((x) => (Number(x.qty) || 0) > 0);
save(next);
    next = next.filter(x => (Number(x.qty) || 0) > 0);
    save(next);
  };
  const remove = (item) => save(items.filter(x => keyOf(x) !== keyOf(item)));

  const totals = useMemo(() => items.reduce((a, x) => {
    const q = Number(x.qty) || 1;
    const price = Number(x.selling_price ?? x.price) || 0;
    const mrp = Number(x.mrp ?? x.cancelprice ?? price) || price;
    a.pay += price * q; a.mrp += mrp * q; a.qty += q; return a;
  }, { pay: 0, mrp: 0, qty: 0 }), [items]);

  const confirm = () => {
    if (!items.length) return;
    localStorage.setItem("checkout_cart", JSON.stringify(items));
    localStorage.setItem("checkout_total", String(totals.pay));
    navigate("/address");
  };

  return <div className="max-w-md mx-auto bg-white min-h-screen border shadow-sm pb-32">
    <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 py-5 border-b">
      <h1 className="text-xl font-bold">Your Cart</h1>
      <button onClick={() => navigate(-1)} className="text-3xl leading-none">×</button>
    </header>

    {!items.length ? <div className="p-10 text-center text-gray-500">Your cart is empty.</div> : items.map((item) => {
      const price = Number(item.selling_price ?? item.price) || 0;
      const mrp = Number(item.mrp ?? item.cancelprice ?? price) || price;
      return <div key={keyOf(item)} className="flex gap-4 p-4 border-b">
        <img src={item.img1 || item.image?.[0]} alt="" className="w-24 h-24 object-contain border rounded" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2"><h3 className="font-semibold truncate">{item.name || item.title}</h3><button onClick={() => remove(item)} className="text-gray-400 text-lg">🗑</button></div>
          <div className="mt-2"><b>₹{price.toFixed(0)}</b> {mrp > price && <span className="ml-2 line-through text-gray-400">₹{mrp.toFixed(0)}</span>}</div>
          <div className="text-sm mt-3 text-gray-700">{[item.color && `Color: ${item.color}`, item.size && `Size: ${item.size}`, item.storage && `Storage: ${item.storage}`].filter(Boolean).join(" · ")}</div>
          <div className="inline-grid grid-cols-3 border border-blue-500 rounded mt-3 overflow-hidden h-8">
            <button onClick={() => changeQty(item, -1)} className="px-3 text-blue-600 font-bold">−</button>
            <span className="px-3 flex items-center justify-center font-semibold">{Number(item.qty) || 1}</span>
            <button onClick={() => changeQty(item, 1)} className="px-3 text-blue-600 font-bold">+</button>
          </div>
        </div>
      </div>;
    })}

    {!!items.length && <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg p-4">
      <div className="flex justify-between text-sm"><b>Cart Total:</b><b>₹{totals.pay.toFixed(2)}</b></div>
      <div className="flex justify-between text-sm mt-2"><b>Shipping:</b><b>FREE</b></div>
      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-dashed"><b>To Pay:</b><b>₹{totals.pay.toFixed(2)}</b></div>
      <div className="flex items-center gap-4 mt-4"><div className="flex-1"><div className="text-xl font-bold">₹{totals.pay.toFixed(2)}</div><div className="text-xs text-gray-500">Inclusive of all taxes</div></div><button onClick={confirm} className="flex-1 bg-blue-600 text-white font-semibold rounded-md py-3">Confirm Order</button></div>
    </footer>}
  </div>;
}
