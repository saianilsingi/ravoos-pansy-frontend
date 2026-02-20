import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import useDebounce from "../../hooks/useDebounce";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

const ITEMS_PER_PAGE = 10;
const FALLBACK_IMAGE = "https://dummyimage.com/80x80/e0e0e0/555&text=No+Img";

function flattenTree(nodes, depth = 0) {
  const result = [];
  for (const node of nodes) {
    result.push({ ...node, depth });
    if (node.children?.length) result.push(...flattenTree(node.children, depth + 1));
  }
  return result;
}

const emptyForm = { name: "", description: "", price: "", category_id: "", image: "", stock: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const toast = useToast();

  useEffect(() => { document.title = "Products | Admin"; }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/products/");
      setProducts(res.data);
    } catch {
      toast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
    api.get("categories/tree/")
      .then((res) => setCategories(flattenTree(res.data)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = debouncedSearch
    ? products.filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : products;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      category_id: p.category?.id || "",
      image: p.image || "",
      stock: p.stock ?? 0,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category_id) {
      toast("Name, price, and category are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        price: Number(form.price),
        category: Number(form.category_id),
        image: form.image,
        stock: Number(form.stock) || 0,
      };

      if (editing) {
        await api.put(`admin/products/${editing}/`, payload);
        toast("Product updated!", "success");
      } else {
        await api.post("admin/products/", payload);
        toast("Product added!", "success");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast(err.response?.data?.detail || "Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`admin/products/${deleteTarget}/delete/`);
      toast("Product deleted", "success");
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast("Failed to delete product", "error");
    }
  };

  const inputClass = "w-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-lg px-4 py-2 text-sm transition-colors";

  const columns = [
    {
      key: "image",
      label: "",
      className: "w-12",
      render: (row) => (
        <img
          src={row.image || FALLBACK_IMAGE}
          alt=""
          className="w-10 h-10 rounded-lg object-cover bg-stone-100 dark:bg-stone-800"
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => <span className="font-medium text-stone-800 dark:text-stone-200 truncate block max-w-[200px]">{row.name}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="text-stone-500 dark:text-stone-400 text-xs">
          {row.category?.breadcrumb ? row.category.breadcrumb.map((c) => c.name).join(" > ") : row.category?.name || "—"}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      render: (row) => <span className="font-medium">₹{row.price}</span>,
    },
    {
      key: "stock",
      label: "Stock",
      align: "right",
      render: (row) => {
        const color = row.stock === 0
          ? "text-red-500 dark:text-red-400"
          : row.stock <= 5
            ? "text-amber-600 dark:text-amber-400"
            : "text-stone-600 dark:text-stone-400";
        return <span className={`font-medium ${color}`}>{row.stock === 0 ? "Out" : row.stock}</span>;
      },
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <button onClick={() => openEdit(row)} className="text-amber-600 dark:text-amber-400 hover:underline text-xs font-medium">Edit</button>
          <button onClick={() => setDeleteTarget(row.id)} className="text-red-500 dark:text-red-400 hover:underline text-xs">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900
                     rounded-lg px-4 py-2 text-sm w-full sm:w-72
                     focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
        />
        <button
          onClick={openCreate}
          className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium
                     hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors shrink-0"
        >
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
        <DataTable columns={columns} data={paginated} loading={loading} emptyMessage="No products found" />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product" : "Add Product"} maxWidth="max-w-xl">
        <div className="space-y-3">
          <input name="name" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input name="price" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
            <input name="stock" placeholder="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} />
          </div>
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {"\u00A0\u00A0".repeat(cat.depth)}{cat.depth > 0 ? "└ " : ""}{cat.name}
              </option>
            ))}
          </select>
          <input name="image" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} />
          <textarea name="description" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setModalOpen(false)} className="border border-stone-300 dark:border-stone-700 px-4 py-2 rounded-lg text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium
                       hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : editing ? "Update" : "Add Product"}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
