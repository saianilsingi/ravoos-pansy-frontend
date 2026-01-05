import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("view"); // view | editProfile | addresses
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

  /* ---------------- GUEST VIEW ---------------- */
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center bg-white border rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Welcome</h2>
        <p className="text-gray-600 mb-6">
          Please login or signup to manage your account
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50"
          >
            Signup
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- LOAD ADDRESSES (USER ONLY) ---------------- */
  useEffect(() => {
    if (user.role === "user") {
      api.get("auth/addresses/")
        .then(res => setAddresses(res.data))
        .catch(() => {});
    }
  }, [user]);

  /* ---------------- UPDATE NAME ---------------- */
  const updateName = async () => {
    try {
      await api.put("profile/", { name });
      alert("Name updated");
      setMode("view");
    } catch {
      alert("Failed to update name");
    }
  };

  /* ---------------- ADDRESS HANDLERS ---------------- */
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
    } catch {
      alert("Failed to save address");
    }
  };

  const editAddress = (addr) => {
    setEditingAddress(addr.id);
    setForm(addr);
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    await api.delete(`auth/addresses/${id}/delete/`);
    setAddresses(addresses.filter(a => a.id !== id));
  };

  /* ---------------- MAIN RENDER ---------------- */
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* VIEW MODE */}
      {mode === "view" && (
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-2xl font-semibold">Profile</h2>

          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setMode("editProfile")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Edit Profile
            </button>

            {user.role === "user" && (
              <>
                <button
                  onClick={() => setMode("addresses")}
                  className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Manage Addresses
                </button>

                <button
                  onClick={() => navigate("/orders")}
                  className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  My Orders
                </button>
              </>
            )}

            {user.role === "admin" && (
              <button
                onClick={() => navigate("/admin-panel")}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Admin Dashboard
              </button>
            )}

            <button
              onClick={logout}
              className="text-red-500 hover:underline ml-auto"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE */}
      {mode === "editProfile" && (
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-semibold">Edit Name</h3>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />

          <div className="flex gap-3">
            <button
              onClick={updateName}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              onClick={() => setMode("view")}
              className="border px-5 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ADDRESS MANAGEMENT */}
      {mode === "addresses" && user.role === "user" && (
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-xl font-semibold">My Addresses</h3>

          {addresses.map(addr => (
            <div
              key={addr.id}
              className="border rounded-lg p-3 flex justify-between items-center"
            >
              <p className="text-sm">
                {addr.full_name}, {addr.city}
              </p>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => editAddress(addr)}
                  className="text-indigo-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="text-red-500 hover:underline"
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

            {Object.keys(form).filter(k => k !== "is_default").map(key => (
              <input
                key={key}
                name={key}
                placeholder={key.replace("_", " ")}
                value={form[key]}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
            ))}

            <div className="flex gap-3">
              <button
                onClick={saveAddress}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
              >
                {editingAddress ? "Update Address" : "Add Address"}
              </button>
              <button
                onClick={() => setMode("view")}
                className="border px-5 py-2 rounded-lg hover:bg-gray-50"
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
