import { useEffect, useState } from "react";
import api from "../api/axios";

/* ------------------ STATUS CONFIG ------------------ */
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
    return <p className="text-red-500 text-sm">❌ Order Cancelled</p>;
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex gap-2 mt-2 flex-wrap">
      {STATUS_STEPS.map((step, index) => (
        <span
          key={step}
          className={`px-3 py-1 rounded-full text-xs
            ${index <= currentIndex
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-600"}`}
        >
          {STATUS_LABELS[step]}
        </span>
      ))}
    </div>
  );
}

/* ------------------ MAIN ------------------ */
export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("orders/")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await api.delete(`orders/${id}/delete/`);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <h2 className="text-2xl font-semibold mb-6">
        Your Orders
      </h2>

      {orders.length === 0 && (
        <p className="text-gray-500">No orders yet</p>
      )}

      <div className="space-y-6">
        {orders.map(order => (
          <div
            key={order.id}
            className="bg-white border rounded-xl p-5 shadow-sm"
          >
            <h4 className="font-semibold">
              Order #{order.id}
            </h4>

            <p className="text-sm mt-1">
              <b>Status:</b> {STATUS_LABELS[order.status]}
            </p>

            <StatusTimeline status={order.status} />

            <hr className="my-4" />

            <p>Subtotal: ₹{order.subtotal}</p>
            <p>GST: ₹{order.gst}</p>
            <p>Discount: ₹{order.discount}</p>
            <p className="font-semibold">
              Total: ₹{order.total}
            </p>

            {["delivered", "cancelled"].includes(order.status) && (
              <button
                onClick={() => deleteOrder(order.id)}
                className="mt-4 text-sm text-red-500 hover:underline"
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
