import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

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

  // Load addresses - must be before any early return to respect hooks rules
  useEffect(() => {
    if (!user || user.role !== "user") return;
    api.get("auth/addresses/")
      .then((res) => setAddresses(res.data))
      .catch(() => {});
  }, [user]);

  // Guest view
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center bg-white dark:bg-stone-900
                      border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm">
        <div className="text-5xl mb-4">👤</div>
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
    );
  }

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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* VIEW MODE */}
      {mode === "view" && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                        rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold">Profile</h2>

          <div className="text-stone-600 dark:text-stone-400 space-y-1">
            <p><b className="text-stone-900 dark:text-stone-100">Name:</b> {user.name}</p>
            <p><b className="text-stone-900 dark:text-stone-100">Email:</b> {user.email}</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setMode("editProfile")}
              className="bg-amber-600 dark:bg-amber-500 text-white px-4 py-2 rounded-lg
                         hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
            >
              Edit Profile
            </button>

            {user.role === "user" && (
              <>
                <button
                  onClick={() => setMode("addresses")}
                  className="border border-stone-300 dark:border-stone-700 px-4 py-2 rounded-lg
                             hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  Manage Addresses
                </button>

                <button
                  onClick={() => navigate("/orders")}
                  className="border border-stone-300 dark:border-stone-700 px-4 py-2 rounded-lg
                             hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  My Orders
                </button>
              </>
            )}

            {user.role === "admin" && (
              <button
                onClick={() => navigate("/admin-panel")}
                className="border border-stone-300 dark:border-stone-700 px-4 py-2 rounded-lg
                           hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Admin Dashboard
              </button>
            )}

            <button
              onClick={logout}
              className="text-red-500 dark:text-red-400 hover:underline ml-auto"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE */}
      {mode === "editProfile" && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                        rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-bold">Edit Name</h3>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-stone-300 dark:border-stone-700
                       bg-white dark:bg-stone-900 rounded-lg px-4 py-2 transition-colors"
          />

          <div className="flex gap-3">
            <button
              onClick={updateName}
              className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                         hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setMode("view")}
              className="border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-lg
                         hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ADDRESS MANAGEMENT */}
      {mode === "addresses" && user.role === "user" && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                        rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-xl font-bold">My Addresses</h3>

          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-stone-200 dark:border-stone-700 rounded-lg p-3
                         flex justify-between items-center gap-3"
            >
              <p className="text-sm min-w-0 truncate">
                {addr.full_name}, {addr.city}
              </p>
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
          ))}

          <div className="space-y-3">
            <h4 className="font-semibold">
              {editingAddress ? "Edit Address" : "Add Address"}
            </h4>

            {Object.keys(form)
              .filter((k) => k !== "is_default")
              .map((key) => (
                <input
                  key={key}
                  name={key}
                  placeholder={key.replace("_", " ")}
                  value={form[key]}
                  onChange={handleChange}
                  className="w-full border border-stone-300 dark:border-stone-700
                             bg-white dark:bg-stone-900 rounded-lg px-4 py-2 transition-colors"
                />
              ))}

            <div className="flex gap-3">
              <button
                onClick={saveAddress}
                className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                           hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
              >
                {editingAddress ? "Update Address" : "Add Address"}
              </button>
              <button
                onClick={() => setMode("view")}
                className="border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-lg
                           hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
