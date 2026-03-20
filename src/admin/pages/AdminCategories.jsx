import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

function flattenTree(nodes, depth = 0) {
  const result = [];
  for (const node of nodes) {
    result.push({ ...node, depth });
    if (node.children?.length) result.push(...flattenTree(node.children, depth + 1));
  }
  return result;
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function CategoryNode({ node, depth = 0, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children?.length > 0;

  return (
    <div>
      <div className="flex items-center group hover:bg-stone-50 dark:hover:bg-stone-800/50 rounded-lg px-2 py-1.5 transition-colors">
        {/* Expand/collapse */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-6 h-6 flex items-center justify-center text-stone-400 dark:text-stone-500
                       hover:text-stone-600 dark:hover:text-stone-300 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}

        {/* Name + slug */}
        <div className="flex-1 min-w-0" style={{ paddingLeft: `${depth * 16}px` }}>
          <span className="font-medium text-sm text-stone-800 dark:text-stone-200">{node.name}</span>
          <span className="ml-2 text-xs text-stone-400 dark:text-stone-500">{node.full_slug}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(node)} className="text-amber-600 dark:text-amber-400 hover:underline text-xs font-medium">Edit</button>
          <button onClick={() => onDelete(node)} className="text-red-500 dark:text-red-400 hover:underline text-xs">Delete</button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <CategoryNode key={child.id} node={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

const emptyForm = { name: "", slug: "", parent: "", theme: "", is_active: true };

export default function AdminCategories() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { document.title = "Categories | Admin"; }, []);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("categories/tree/");
      setTree(res.data);
    } catch {
      toast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  const flatCategories = flattenTree(tree);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (node) => {
    setEditing(node.id);
    // Find parent id — we need to match from the flat list
    const flat = flatCategories.find((c) => c.id === node.id);
    setForm({
      name: node.name,
      slug: node.slug || "",
      parent: flat?.parent || "",
      theme: node.theme || "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: !editing ? slugify(name) : prev.slug,
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast("Name and slug are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        parent: form.parent || null,
        theme: form.theme,
        is_active: form.is_active,
      };

      if (editing) {
        await api.put(`admin/categories/${editing}/`, payload);
        toast("Category updated!", "success");
      } else {
        await api.post("admin/categories/", payload);
        toast("Category created!", "success");
      }
      setModalOpen(false);
      fetchTree();
    } catch (err) {
      const msg = err.response?.data?.parent?.[0]
        || err.response?.data?.error
        || err.response?.data?.detail
        || JSON.stringify(err.response?.data)
        || "Failed to save category";
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`admin/categories/${deleteTarget.id}/delete/`);
      toast("Category deleted", "success");
      setDeleteTarget(null);
      fetchTree();
    } catch (err) {
      toast(err.response?.data?.error?.[0] || err.response?.data?.error || "Failed to delete category", "error");
      setDeleteTarget(null);
    }
  };

  const inputClass = "w-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-lg px-4 py-2 text-sm transition-colors";

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-stone-500 dark:text-stone-400">{flatCategories.length} categories</p>
        <button
          onClick={openCreate}
          className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium
                     hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
        >
          Add Category
        </button>
      </div>

      {/* Tree */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-stone-200 dark:bg-stone-700 rounded" />
            ))}
          </div>
        ) : tree.length === 0 ? (
          <p className="text-center text-stone-400 dark:text-stone-500 py-8">No categories yet. Create one to get started.</p>
        ) : (
          tree.map((node) => (
            <CategoryNode key={node.id} node={node} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "Add Category"}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Name</label>
            <input value={form.name} onChange={handleNameChange} placeholder="Category name" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Slug</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="category-slug" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Parent</label>
            <select value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} className={inputClass}>
              <option value="">None (root category)</option>
              {flatCategories
                .filter((c) => c.id !== editing)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"\u00A0\u00A0".repeat(cat.depth)}{cat.depth > 0 ? "└ " : ""}{cat.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Theme</label>
            <input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="e.g. food, clothing" className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-amber-600" />
            Active
          </label>
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
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Categories with children or products cannot be deleted.`}
      />
    </div>
  );
}
