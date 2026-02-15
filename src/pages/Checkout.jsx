import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshCart } = useCart();

  useEffect(() => {
    document.title = "Checkout | Ravoos Pansy";
  }, []);

  useEffect(() => {
    api
      .get("auth/addresses/")
      .then((res) => {
        setAddresses(res.data);
        const def = res.data.find((a) => a.is_default);
        if (def) setSelectedAddress(def.id);
      })
      .catch(() => setError("Failed to load addresses"));

    api
      .get("cart/")
      .then((res) => setCartItems(res.data))
      .catch(() => setError("Failed to load cart"));
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const gst = subtotal * 0.05;
  const discount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
  const total = Math.max(0, subtotal + gst - discount);

  const applyCoupon = async () => {
    const code = coupon.trim();
    if (!code) {
      toast("Enter a coupon code", "error");
      return;
    }

    try {
      const res = await api.post("coupons/validate/", { code });
      setAppliedCoupon(res.data);
      toast(`Coupon "${res.data.code}" applied!`, "success");
    } catch (err) {
      toast(err.response?.data?.error || "Invalid coupon", "error");
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCoupon("");
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError("Please select address");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setSubmitting(true);
    setError("");

    // Step 1: Create payment intent
    let intentData;
    try {
      const res = await api.post("payments/create-intent/", {
        address_id: selectedAddress,
        coupon: appliedCoupon?.code || null,
      });
      intentData = res.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate payment");
      setSubmitting(false);
      return;
    }

    // Step 2: Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast("Failed to load payment gateway", "error");
      setSubmitting(false);
      return;
    }

    // Step 3: Open Razorpay checkout
    const options = {
      key: intentData.razorpay_key,
      amount: Math.round(parseFloat(intentData.amount) * 100),
      currency: intentData.currency,
      order_id: intentData.razorpay_order_id,
      name: "Ravoos Pansy",
      description: "Order Payment",
      handler: async (response) => {
        // Step 4: Verify payment
        try {
          const verifyRes = await api.post("payments/verify/", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setBill(verifyRes.data);
          refreshCart();
        } catch (err) {
          toast(err.response?.data?.error || "Payment verification failed", "error");
        } finally {
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => {
          toast("Payment cancelled", "error");
          setSubmitting(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      toast("Payment failed. Please try again.", "error");
      setSubmitting(false);
    });
    rzp.open();
  };

  if (bill) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold">Order Placed!</h2>

        <div className="text-stone-600 dark:text-stone-400 space-y-1">
          <p>Order ID: {bill.order_id}</p>
          <p>Subtotal: ₹{bill.subtotal}</p>
          <p>GST: ₹{bill.gst}</p>
          {Number(bill.discount) > 0 && (
            <p className="text-green-600 dark:text-green-400">Discount: -₹{bill.discount}</p>
          )}
        </div>

        <h3 className="text-xl font-bold">Total: ₹{bill.total}</h3>

        <button
          onClick={() => navigate("/orders")}
          className="mt-4 bg-amber-600 dark:bg-amber-500 text-white px-6 py-3 rounded-lg
                     hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
        >
          View Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h2 className="text-2xl font-bold">Checkout</h2>

      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      {/* ADDRESS */}
      <div className="space-y-3">
        <h3 className="font-semibold">Select Address</h3>

        {addresses.map((addr) => (
          <label
            key={addr.id}
            className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition-all ${
              selectedAddress === addr.id
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-600"
                : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
            }`}
          >
            <input
              type="radio"
              checked={selectedAddress === addr.id}
              onChange={() => setSelectedAddress(addr.id)}
              className="accent-amber-600 dark:accent-amber-500 mt-0.5"
            />
            <span className="text-sm break-words min-w-0">
              {addr.full_name}, {addr.street}, {addr.city}
            </span>
          </label>
        ))}

        <button
          onClick={() => navigate("/profile")}
          className="text-amber-600 dark:text-amber-400 text-sm hover:underline font-medium"
        >
          + Add / Edit Address
        </button>
      </div>

      {/* COUPON */}
      <div>
        <h3 className="font-semibold mb-2">Coupon</h3>

        {appliedCoupon ? (
          <div className="flex items-center gap-3">
            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium">
              {appliedCoupon.code} — ₹{appliedCoupon.discount_amount} off
            </span>
            <button
              onClick={removeCoupon}
              className="text-red-500 dark:text-red-400 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-1 border border-stone-300 dark:border-stone-700
                         bg-white dark:bg-stone-900
                         rounded-lg px-4 py-2 transition-colors"
            />
            <button
              onClick={applyCoupon}
              className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                         hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* PRICE SUMMARY */}
      {cartItems.length > 0 && (
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                        rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500 dark:text-stone-400">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 dark:text-stone-400">GST (5%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t border-stone-200 dark:border-stone-700 pt-2">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* CONFIRM */}
      <button
        onClick={handleCheckout}
        disabled={submitting}
        className="w-full bg-amber-600 dark:bg-amber-500 text-white py-3 rounded-lg font-semibold
                   hover:bg-amber-700 dark:hover:bg-amber-400 shadow-md hover:shadow-lg transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
      </button>
    </div>
  );
}
