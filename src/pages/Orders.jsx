import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

const STATUS_STEPS = [
  "placed",
  "packing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const STATUS_LABELS = {
  placed: "Order Placed",
  packing: "Packing Started",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function StatusTimeline({ status }) {
  if (status === "cancelled") {
    return <p className="text-red-500 dark:text-red-400 text-sm mt-2">Order Cancelled</p>;
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap">
      {STATUS_STEPS.map((step, index) => (
        <span
          key={step}
          className={`px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium ${
            index <= currentIndex
              ? "bg-green-600 text-white"
              : "bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400"
          }`}
        >
          {STATUS_LABELS[step]}
        </span>
      ))}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    document.title = "Orders | Ravoos Pansy";
  }, []);

  useEffect(() => {
    api
      .get("orders/")
      .then((res) => setOrders(res.data))
      .catch(() => toast("Failed to load orders", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await api.delete(`orders/${id}/delete/`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast("Order deleted", "success");
    } catch (err) {
      toast(err.response?.data?.error || "Delete failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 animate-pulse space-y-3"
          >
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/4" />
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>

      {orders.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            Your order history will appear here.
          </p>
          <Link
            to="/items"
            className="bg-amber-600 dark:bg-amber-500 text-white px-6 py-3 rounded-lg
                       hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                       rounded-xl p-5 shadow-sm"
          >
            <h4 className="font-semibold">Order #{order.id}</h4>

            <p className="text-sm mt-1 text-stone-600 dark:text-stone-400">
              <b className="text-stone-900 dark:text-stone-100">Status:</b> {STATUS_LABELS[order.status]}
            </p>

            <StatusTimeline status={order.status} />

            <hr className="my-4 border-stone-200 dark:border-stone-700" />

            <div className="text-sm space-y-1 text-stone-600 dark:text-stone-400">
              <p>Subtotal: ₹{order.subtotal}</p>
              <p>GST: ₹{order.gst}</p>
              <p>Discount: ₹{order.discount}</p>
            </div>
            <p className="font-bold mt-1">Total: ₹{order.total}</p>

            {["delivered", "cancelled"].includes(order.status) && (
              <button
                onClick={() => deleteOrder(order.id)}
                className="mt-4 text-sm text-red-500 dark:text-red-400 hover:underline"
              >
                Delete Order
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
