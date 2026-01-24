import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image: "",
  });

  // Load products & categories
  useEffect(() => {
    fetchProducts();
    api.get("categories/")
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error("Failed to load categories:", err);
        alert("Failed to load categories. Please refresh the page.");
      });
  }, []);

  const fetchProducts = async () => {
    const res = await api.get("products/");
    setProducts(res.data);
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update product
  const saveProduct = async () => {
    try {
      // 🔒 frontend validation (optional but good)
      if (!form.name || !form.price || !form.category_id) {
        alert("Name, price, and category are required");
        return;
      }
  
      // ✅ MAP frontend → backend schema
      const payload = {
        name: form.name.trim(),
        description: form.description,
        price: Number(form.price),
        category: Number(form.category_id),
        image: form.image,
      };
  
      if (editing) {
        await api.put(`admin/products/${editing}/`, payload);
      } else {
        await api.post("admin/products/", payload);
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
      console.error("BACKEND ERROR:", err.response?.data);
      alert(JSON.stringify(err.response?.data));
    }
  };

  // Edit product
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

  // Delete product
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await api.delete(`admin/products/${id}/delete/`);
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

      {/* HEADER */}
      <h2 className="text-2xl font-semibold">
        Admin Dashboard
      </h2>

      {/* PRODUCT FORM */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          {editing ? "Edit Product" : "Add Product"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Product name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />

          <input
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />

          <input
            name="image"
            placeholder="Image URL"
            value={form.image}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 md:col-span-2"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 md:col-span-2"
          />

          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={saveProduct}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {editing ? "Update Product" : "Add Product"}
          </button>

          {editing && (
            <button
              onClick={() => setEditing(null)}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* PRODUCT LIST */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Products
        </h3>

        <div className="space-y-4">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-xl p-4
                         flex gap-4 items-center hover:shadow-md transition"
            >
              {/* IMAGE */}
              <img
                src={p.image || "https://via.placeholder.com/120"}
                alt={p.name}
                className="w-32 h-20 object-cover rounded-lg bg-gray-100"
              />

              {/* DETAILS */}
              <div className="flex-1">
                <h4 className="font-medium">{p.name}</h4>
                <p className="font-semibold">₹{p.price}</p>
                <p className="text-sm text-gray-500">
                  {p.category?.name || "No Category"}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">
                <button
                  onClick={() => editProduct(p)}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
