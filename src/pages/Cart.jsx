import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get("cart/");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
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
      alert("Failed to update cart");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`cart/remove/${itemId}/`);
      fetchCart();
    } catch {
      alert("Failed to remove item");
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-gray-500">
        Loading cart...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Your cart is empty
        </h2>
        <button
          onClick={() => navigate("/items")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Go to Items
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      <h2 className="text-2xl font-semibold">
        Your Cart
      </h2>

      {/* CART ITEMS */}
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-4
                       flex flex-col sm:flex-row gap-4 items-center"
          >
            {/* PRODUCT INFO */}
            <div className="flex-1">
              <h4 className="font-medium">
                {item.product.name}
              </h4>
              <p className="text-gray-600">
                ₹{item.product.price}
              </p>
            </div>

            {/* QUANTITY */}
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  updateQuantity(item.id, item.quantity - 1)
                }
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              >
                −
              </button>

              <span className="font-semibold">
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  updateQuantity(item.id, item.quantity + 1)
                }
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>

            {/* REMOVE */}
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:underline text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="border-t pt-6 flex flex-col sm:flex-row
                      justify-between items-center gap-4">
        <h3 className="text-xl font-semibold">
          Subtotal: ₹{subtotal}
        </h3>

        <button
          onClick={() => navigate("/checkout")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg
                     hover:bg-indigo-700 transition"
        >
          Proceed to Checkout
        </button>
      </div>

    </div>
  );
}
