import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

const fmt = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

const emptyForm = { code: "", discount_amount: "", is_active: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { document.title = "Coupons | Admin"; }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [couponsRes, analyticsRes] = await Promise.all([
        api.get("admin/coupons/"),
        api.get("admin/analytics/coupons/").catch(() => ({ data: null })),
      ]);
      setCoupons(couponsRes.data);
      setAnalytics(analyticsRes.data);
    } catch {
      toast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Merge analytics data
  const usageMap = {};
  if (analytics?.coupon_usage_summary) {
    for (const entry of analytics.coupon_usage_summary) {
      usageMap[entry.coupon_id] = entry;
    }
  }

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ code: c.code, discount_amount: c.discount_amount, is_active: c.is_active });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discount_amount) {
      toast("Code and discount amount are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_amount: Number(form.discount_amount),
        is_active: form.is_active,
      };

      if (editing) {
        await api.put(`admin/coupons/${editing}/`, payload);
        toast("Coupon updated!", "success");
      } else {
        await api.post("admin/coupons/", payload);
        toast("Coupon created!", "success");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast(err.response?.data?.code?.[0] || "Failed to save coupon", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`admin/coupons/${deleteTarget}/delete/`);
      toast("Coupon deleted", "success");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast("Failed to delete coupon", "error");
    }
  };

  const inputClass = "w-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-lg px-4 py-2 text-sm transition-colors";

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (row) => <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{row.code}</span>,
    },
    {
      key: "discount_amount",
      label: "Discount",
      render: (row) => <span className="font-medium">₹{row.discount_amount}</span>,
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => <StatusBadge status={row.is_active} type="coupon" />,
    },
    {
      key: "uses",
      label: "Uses",
      align: "right",
      render: (row) => <span className="text-stone-600 dark:text-stone-400">{usageMap[row.id]?.times_used || 0}</span>,
    },
    {
      key: "revenue",
      label: "Revenue",
      align: "right",
      render: (row) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          {usageMap[row.id] ? fmt(usageMap[row.id].revenue_generated) : "₹0"}
        </span>
      ),
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
    <div className="space-y-4 max-w-5xl">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-stone-500 dark:text-stone-400">{coupons.length} coupons</p>
        <button
          onClick={openCreate}
          className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium
                     hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
        >
          Add Coupon
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
        <DataTable columns={columns} data={coupons} loading={loading} emptyMessage="No coupons yet" />
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Coupon" : "Add Coupon"}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              onBlur={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="SAVE20"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Discount Amount (₹)</label>
            <input
              type="number"
              value={form.discount_amount}
              onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
              placeholder="100"
              className={inputClass}
            />
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
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
      />
    </div>
  );
}
