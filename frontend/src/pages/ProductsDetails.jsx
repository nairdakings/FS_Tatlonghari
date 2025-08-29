import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";
import { BASE_URL } from "../api/api";
import { useParams } from "react-router-dom";

export default function ProductDetails() {
  const [qty, setQty] = React.useState(1);
  const [productDetails, setProductDetails] = useState({});
  const [adding, setAdding] = useState(false);

  const { product_id } = useParams();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}api/products/${product_id}/`
        );
        setProductDetails(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProductDetails();
  }, [product_id]);

  // Prefer `stock` if available; fall back to 1 to keep controls safe.
  const clamp = (n) => Math.max(1, Math.min(n, productDetails.countInStock ?? 1));
  const dec = () => setQty((q) => clamp(q - 1));
  const inc = () => setQty((q) => clamp(q + 1));

  const stock = productDetails.countInStock ?? 0; // normalize
  const isOut = stock <= 0;

  const price = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(productDetails.product_price);

  // 🔗 Add to Cart -> POST /api/cart/add/  { product_id, qty }
  const handleAddToCart = async () => {
  if (isOut) return;
  setAdding(true);
  try {
    await axiosInstance.post(`${BASE_URL}api/cart/add/`, {
      product_id: Number(product_id), 
      qty,
    });
    alert("Added to cart!");
  } catch (e) {
    console.error("Cart error:", e.response?.data || e.message);
    const status = e?.response?.status;
    if (status === 401) {
      alert("Please sign in to add items to your cart.");
    } else {
      alert("Unable to add to cart. Please try again.");
    }
  } finally {
    setAdding(false);
  }
};

  return (
    <div className="mx-auto h-screen max-w-6xl px-4 py-6 md:py-10">
      {/* Top section: image + details */}
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        {/* Image */}
        <div className="flex items-center justify-center">
          <img
            src={`${BASE_URL}${productDetails.image}`}
            alt={productDetails.product_name}
            className="h-auto max-h-72 w-auto rounded-md object-contain md:max-h-80"
          />
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {productDetails.product_name}
          </h1>

          <p className="text-xl font-medium text-zinc-900">{price}</p>

          <p className="text-sm text-zinc-600">
            Available Stocks:{" "}
            <span className="font-medium text-zinc-900">{stock}</span>
          </p>

          {/* Quantity + Add to cart */}
          <div className="space-y-3">
            <div className="inline-flex items-stretch rounded-md border border-zinc-300">
              <button
                type="button"
                onClick={dec}
                disabled={qty <= 1 || isOut}
                aria-label="Decrease quantity"
                className="px-3 py-2 text-sm font-medium hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                −
              </button>
              <div className="min-w-[3rem] select-none border-x border-zinc-300 px-3 py-2 text-center text-sm">
                {qty}
              </div>
              <button
                type="button"
                onClick={inc}
                disabled={qty >= stock || isOut}
                aria-label="Increase quantity"
                className="px-3 py-2 text-sm font-medium hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart} // ✅ hook up here
              disabled={isOut || adding}
              className="w-full rounded-md bg-[#0e1f4a] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isOut ? "Out of stock" : adding ? "Adding…" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-10 max-w-3xl">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900">
          Description
        </h2>
        <p className="text-sm leading-relaxed text-zinc-700">
          {productDetails.description}
        </p>
      </div>
    </div>
  );
}
