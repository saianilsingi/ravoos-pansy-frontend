import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

const FIELD_LABELS = {
  full_name: "Full Name",
  phone: "Phone",
  street: "Street Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
  landmark: "Landmark",
};

export default function Profile() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState("view");
  const [name, setName] = useState(user?.name || "");
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    is_default: false,
  });

  useEffect(() => {
    document.title = "Profile | Ravoos Pansy";
  }, []);

  useEffect(() => {
    if (!user || user.role !== "user") return;
    api.get("auth/addresses/")
      .then((res) => setAddresses(res.data))
      .catch(() => {});
  }, [user]);

  // Guest view
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                        rounded-xl p-8 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-stone-200 dark:bg-stone-700
                          flex items-center justify-center">
            <span className="text-3xl text-stone-400 dark:text-stone-500">?</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            Please login or signup to manage your account
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                         hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-lg
                         hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = (user.name || user.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const updateName = async () => {
    try {
      await api.put("auth/me/", { name });
      await refreshUser();
      toast("Name updated!", "success");
      setMode("view");
    } catch {
      toast("Failed to update name", "error");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveAddress = async () => {
    try {
      if (editingAddress) {
        await api.put(`auth/addresses/${editingAddress}/`, form);
      } else {
        await api.post("auth/addresses/", form);
      }

      setEditingAddress(null);
      setForm({
        full_name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        is_default: false,
      });

      const res = await api.get("auth/addresses/");
      setAddresses(res.data);
      toast("Address saved!", "success");
    } catch {
      toast("Failed to save address", "error");
    }
  };

  const editAddress = (addr) => {
    setEditingAddress(addr.id);
    setForm(addr);
  };

  const cancelEditAddress = () => {
    setEditingAddress(null);
    setForm({
      full_name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      is_default: false,
    });
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`auth/addresses/${id}/delete/`);
      setAddresses(addresses.filter((a) => a.id !== id));
      toast("Address deleted", "success");
    } catch {
      toast("Failed to delete address", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* PROFILE HEADER */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                      rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/40
                          flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {initials}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {mode === "editProfile" ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-stone-500 dark:text-stone-400">
                  Display Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-stone-300 dark:border-stone-700
                             bg-white dark:bg-stone-800 rounded-lg px-4 py-2
                             focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400
                             transition-colors"
                />
                <div className="flex gap-3 justify-center sm:justify-start">
                  <button
                    onClick={updateName}
                    className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                               hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setMode("view"); setName(user.name || ""); }}
                    className="border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-lg
                               hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h2 className="text-xl font-bold">{user.name || "User"}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    user.role === "admin"
                      ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                      : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                  }`}>
                    {user.role === "admin" ? "Admin" : "Customer"}
                  </span>
                </div>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">{user.email}</p>
                <button
                  onClick={() => setMode("editProfile")}
                  className="text-amber-600 dark:text-amber-400 text-sm font-medium hover:underline mt-2"
                >
                  Edit name
                </button>
              </>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="text-sm text-red-500 dark:text-red-400 hover:underline shrink-0"
          >
            Logout
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      {mode === "view" && (
        <div className={`grid gap-4 ${user.role === "admin" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
          {user.role === "user" && (
            <>
              <button
                onClick={() => navigate("/orders")}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                           rounded-xl p-5 shadow-sm text-left
                           hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all group"
              >
                <div className="text-2xl mb-2">📦</div>
                <h3 className="font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  My Orders
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Track and manage your orders
                </p>
              </button>

              <button
                onClick={() => setMode("addresses")}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                           rounded-xl p-5 shadow-sm text-left
                           hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all group"
              >
                <div className="text-2xl mb-2">📍</div>
                <h3 className="font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Addresses
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {addresses.length} saved address{addresses.length !== 1 ? "es" : ""}
                </p>
              </button>

              <button
                onClick={() => navigate("/items")}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                           rounded-xl p-5 shadow-sm text-left
                           hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all group"
              >
                <div className="text-2xl mb-2">🛍️</div>
                <h3 className="font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Browse Items
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Explore our collection
                </p>
              </button>
            </>
          )}

          {user.role === "admin" && (
            <>
              <button
                onClick={() => navigate("/admin-panel")}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                           rounded-xl p-5 shadow-sm text-left
                           hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all group"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <h3 className="font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Admin Dashboard
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Manage products, orders & coupons
                </p>
              </button>

              <button
                onClick={() => navigate("/items")}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                           rounded-xl p-5 shadow-sm text-left
                           hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all group"
              >
                <div className="text-2xl mb-2">🛍️</div>
                <h3 className="font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  View Storefront
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  See the customer-facing store
                </p>
              </button>
            </>
          )}
        </div>
      )}

      {/* ADDRESS MANAGEMENT */}
      {mode === "addresses" && user.role === "user" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">My Addresses</h3>
            <button
              onClick={() => setMode("view")}
              className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700
                         dark:hover:text-stone-200 transition-colors"
            >
              ← Back to Profile
            </button>
          </div>

          {/* Saved addresses */}
          {addresses.length === 0 && !editingAddress && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                            rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">📍</div>
              <p className="text-stone-500 dark:text-stone-400">
                No saved addresses yet. Add one below.
              </p>
            </div>
          )}

          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                         rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{addr.full_name}</p>
                    {addr.is_default && (
                      <span className="text-[11px] font-medium bg-amber-100 dark:bg-amber-900/40
                                       text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {addr.street}{addr.landmark ? `, ${addr.landmark}` : ""}
                  </p>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  {addr.phone && (
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      Phone: {addr.phone}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 text-sm shrink-0">
                  <button
                    onClick={() => editAddress(addr)}
                    className="text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-red-500 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add / Edit address form */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                          rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-semibold">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(form)
                .filter((k) => k !== "is_default")
                .map((key) => (
                  <div key={key} className={key === "street" ? "sm:col-span-2" : ""}>
                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">
                      {FIELD_LABELS[key]}
                    </label>
                    <input
                      name={key}
                      placeholder={FIELD_LABELS[key]}
                      value={form[key]}
                      onChange={handleChange}
                      className="w-full border border-stone-300 dark:border-stone-700
                                 bg-white dark:bg-stone-800 rounded-lg px-4 py-2
                                 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400
                                 placeholder:text-stone-400 dark:placeholder:text-stone-500
                                 transition-colors"
                    />
                  </div>
                ))}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="accent-amber-600 dark:accent-amber-500"
              />
              <span className="text-stone-600 dark:text-stone-400">Set as default address</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={saveAddress}
                className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                           hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors text-sm font-medium"
              >
                {editingAddress ? "Update Address" : "Add Address"}
              </button>
              {editingAddress && (
                <button
                  onClick={cancelEditAddress}
                  className="border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-lg
                             hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-sm"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
