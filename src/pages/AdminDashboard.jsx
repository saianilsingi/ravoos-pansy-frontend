import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image: "",
  });

  // Coupon state
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount_amount: "",
    is_active: true,
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get("products/");
      setProducts(res.data);
    } catch {
      toast("Failed to load products", "error");
    }
  };

  useEffect(() => {
    document.title = "Admin Dashboard | Ravoos Pansy";
    fetchProducts();
    fetchCoupons();
    api
      .get("categories/")
      .then((res) => setCategories(res.data))
      .catch(() => {
        toast("Failed to load categories. Please refresh.", "error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProduct = async () => {
    try {
      if (!form.name || !form.price || !form.category_id) {
        toast("Name, price, and category are required", "error");
        return;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description,
        price: Number(form.price),
        category: Number(form.category_id),
        image: form.image,
      };

      if (editing) {
        await api.put(`admin/products/${editing}/`, payload);
        toast("Product updated!", "success");
      } else {
        await api.post("admin/products/", payload);
        toast("Product added!", "success");
      }

      setForm({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image: "",
      });
      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.error("Save error:", err.response?.data);
      toast("Failed to save product", "error");
    }
  };

  const editProduct = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      category_id: p.category?.id || "",
      image: p.image || "",
    });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`admin/products/${id}/delete/`);
      toast("Product deleted", "success");
      fetchProducts();
    } catch {
      toast("Failed to delete product", "error");
    }
  };

  // Coupon functions
  const fetchCoupons = async () => {
    try {
      const res = await api.get("admin/coupons/");
      setCoupons(res.data);
    } catch {
      toast("Failed to load coupons", "error");
    }
  };

  const saveCoupon = async () => {
    try {
      if (!couponForm.code || !couponForm.discount_amount) {
        toast("Code and discount amount are required", "error");
        return;
      }

      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discount_amount: Number(couponForm.discount_amount),
        is_active: couponForm.is_active,
      };

      if (editingCoupon) {
        await api.put(`admin/coupons/${editingCoupon}/`, payload);
        toast("Coupon updated!", "success");
      } else {
        await api.post("admin/coupons/", payload);
        toast("Coupon created!", "success");
      }

      setCouponForm({ code: "", discount_amount: "", is_active: true });
      setEditingCoupon(null);
      fetchCoupons();
    } catch (err) {
      const msg =
        err.response?.data?.code?.[0] || "Failed to save coupon";
      toast(msg, "error");
    }
  };

  const editCoupon = (c) => {
    setEditingCoupon(c.id);
    setCouponForm({
      code: c.code,
      discount_amount: c.discount_amount,
      is_active: c.is_active,
    });
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await api.delete(`admin/coupons/${id}/delete/`);
      toast("Coupon deleted", "success");
      fetchCoupons();
    } catch {
      toast("Failed to delete coupon", "error");
    }
  };

  const inputClass = "border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-lg px-4 py-2 transition-colors";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      {/* PRODUCT FORM */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">
          {editing ? "Edit Product" : "Add Product"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} className={inputClass} />
          <input name="price" placeholder="Price" value={form.price} onChange={handleChange} className={inputClass} />
          <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} className={`${inputClass} md:col-span-2`} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className={`${inputClass} md:col-span-2`} />
          <select name="category_id" value={form.category_id} onChange={handleChange} className={inputClass}>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={saveProduct}
            className="bg-amber-600 dark:bg-amber-500 text-white px-6 py-2 rounded-lg
                       hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
          >
            {editing ? "Update Product" : "Add Product"}
          </button>

          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                setForm({ name: "", description: "", price: "", category_id: "", image: "" });
              }}
              className="border border-stone-300 dark:border-stone-700 px-6 py-2 rounded-lg
                         hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* PRODUCT LIST */}
      <div>
        <h3 className="text-lg font-bold mb-4">Products</h3>

        <div className="space-y-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                         rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center
                         hover:shadow-md transition-all"
            >
              <img
                src={p.image || "https://via.placeholder.com/120"}
                alt={p.name}
                className="w-full sm:w-32 h-32 sm:h-20 object-cover rounded-lg bg-stone-100 dark:bg-stone-800"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{p.name}</h4>
                <p className="font-semibold">₹{p.price}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {p.category?.name || "No Category"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => editProduct(p)}
                  className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="text-red-500 dark:text-red-400 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COUPON FORM */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">
          {editingCoupon ? "Edit Coupon" : "Add Coupon"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            placeholder="Coupon code"
            value={couponForm.code}
            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Discount (₹)"
            value={couponForm.discount_amount}
            onChange={(e) => setCouponForm({ ...couponForm, discount_amount: e.target.value })}
            className={inputClass}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={couponForm.is_active}
              onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
              className="w-4 h-4 accent-amber-600 dark:accent-amber-500"
            />
            Active
          </label>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={saveCoupon}
            className="bg-amber-600 dark:bg-amber-500 text-white px-6 py-2 rounded-lg
                       hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
          >
            {editingCoupon ? "Update Coupon" : "Add Coupon"}
          </button>

          {editingCoupon && (
            <button
              onClick={() => {
                setEditingCoupon(null);
                setCouponForm({ code: "", discount_amount: "", is_active: true });
              }}
              className="border border-stone-300 dark:border-stone-700 px-6 py-2 rounded-lg
                         hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* COUPON LIST */}
      <div>
        <h3 className="text-lg font-bold mb-4">Coupons</h3>

        {coupons.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400 text-sm">No coupons yet.</p>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                           rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <span className="font-mono font-semibold">{c.code}</span>
                  <span className="ml-3 text-stone-500 dark:text-stone-400">₹{c.discount_amount} off</span>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    c.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400"
                  }`}
                >
                  {c.is_active ? "Active" : "Inactive"}
                </span>

                <div className="flex gap-3">
                  <button
                    onClick={() => editCoupon(c)}
                    className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="text-red-500 dark:text-red-400 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
