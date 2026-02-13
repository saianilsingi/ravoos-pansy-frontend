import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { SkeletonLine } from "../components/Skeleton";
import api from "../api/axios";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshCart } = useCart();

  useEffect(() => {
    document.title = "Cart | Ravoos Pansy";
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("cart/");
      setItems(res.data);
    } catch {
      toast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) return;

    try {
      await api.put("cart/update/", {
        item_id: itemId,
        quantity,
      });
      fetchCart();
    } catch {
      toast("Failed to update cart", "error");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`cart/remove/${itemId}/`);
      fetchCart();
      refreshCart();
    } catch {
      toast("Failed to remove item", "error");
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 animate-pulse space-y-3"
          >
            <SkeletonLine width="w-1/3" />
            <SkeletonLine width="w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-stone-500 dark:text-stone-400 mb-6">
          Looks like you haven't added anything yet.
        </p>
        <button
          onClick={() => navigate("/items")}
          className="bg-amber-600 dark:bg-amber-500 text-white px-6 py-3 rounded-lg
                     hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
        >
          Browse Items
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h2 className="text-2xl font-bold">Your Cart</h2>

      {/* CART ITEMS */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                       rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center"
          >
            <div className="flex-1">
              <h4 className="font-medium">{item.product.name}</h4>
              <p className="text-stone-500 dark:text-stone-400">₹{item.product.price}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-10 h-10 flex items-center justify-center border border-stone-300 dark:border-stone-700
                           rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                −
              </button>

              <span className="font-semibold w-6 text-center">{item.quantity}</span>

              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-10 h-10 flex items-center justify-center border border-stone-300 dark:border-stone-700
                           rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 dark:text-red-400 hover:underline py-2 px-3"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="border-t border-stone-200 dark:border-stone-800 pt-6
                      flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold">Subtotal: ₹{subtotal}</h3>

        <button
          onClick={() => navigate("/checkout")}
          className="bg-amber-600 dark:bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold
                     hover:bg-amber-700 dark:hover:bg-amber-400 shadow-md hover:shadow-lg transition-all"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
