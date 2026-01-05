import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("auth/addresses/")
      .then(res => {
        setAddresses(res.data);
        const def = res.data.find(a => a.is_default);
        if (def) setSelectedAddress(def.id);
      })
      .catch(() => setError("Failed to load addresses"));
  }, []);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError("Please select address");
      return;
    }

    try {
      const res = await api.post("orders/checkout/", {
        address_id: selectedAddress,
        coupon: coupon || null,
      });

      setBill(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Checkout failed");
    }
  };

  if (bill) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-2xl font-semibold">
          Order Placed 🎉
        </h2>

        <p>Order ID: {bill.order_id}</p>
        <p>Subtotal: ₹{bill.subtotal}</p>
        <p>GST: ₹{bill.gst}</p>
        <p>Discount: ₹{bill.discount}</p>

        <h3 className="text-xl font-bold">
          Total: ₹{bill.total}
        </h3>

        <button
          onClick={() => navigate("/orders")}
          className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          View Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      <h2 className="text-2xl font-semibold">
        Checkout
      </h2>

      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}

      {/* ADDRESS */}
      <div className="space-y-3">
        <h3 className="font-semibold">
          Select Address
        </h3>

        {addresses.map(addr => (
          <label
            key={addr.id}
            className="flex items-start gap-3 border border-gray-200
                       rounded-lg p-3 cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              checked={selectedAddress === addr.id}
              onChange={() => setSelectedAddress(addr.id)}
            />
            <span className="text-sm">
              {addr.full_name}, {addr.street}, {addr.city}
            </span>
          </label>
        ))}

        <button
          onClick={() => navigate("/profile")}
          className="text-indigo-600 text-sm hover:underline"
        >
          + Add / Edit Address
        </button>
      </div>

      {/* COUPON */}
      <div>
        <h3 className="font-semibold mb-2">
          Coupon
        </h3>
        <input
          type="text"
          placeholder="Enter coupon"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>

      {/* CONFIRM */}
      <button
        onClick={handleCheckout}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg
                   hover:bg-indigo-700 transition"
      >
        Confirm Order
      </button>

    </div>
  );
}
