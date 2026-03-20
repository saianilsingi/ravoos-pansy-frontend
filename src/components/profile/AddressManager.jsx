import { useState, useCallback, useEffect } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import ConfirmDialog from "../../admin/components/ConfirmDialog";

export default function AddressManager() {
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await api.get("auth/addresses/");
      setAddresses(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleSave = async (form, editId) => {
    try {
      if (editId) {
        await api.put(`auth/addresses/${editId}/`, form);
      } else {
        await api.post("auth/addresses/", form);
      }
      await fetchAddresses();
      setEditingAddress(null);
      setShowForm(false);
      toast("Address saved!", "success");
    } catch {
      toast("Failed to save address", "error");
    }
  };

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
    setShowForm(false);
  };

  // Optimistic delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    const prev = addresses;

    // Optimistic: remove immediately
    setAddresses((a) => a.filter((addr) => addr.id !== id));
    setDeleteTarget(null);

    try {
      await api.delete(`auth/addresses/${id}/delete/`);
      toast("Address deleted", "success");
    } catch {
      // Rollback
      setAddresses(prev);
      toast("Failed to delete address", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                                  rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/3 mb-3" />
            <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-2/3 mb-2" />
            <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                        rounded-xl p-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-stone-500 dark:text-stone-400 mb-4">
            No saved addresses yet
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                       hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors text-sm font-medium"
          >
            Add Your First Address
          </button>
        </div>
      )}

      {/* Address list */}
      {addresses.map((addr) => (
        <AddressCard
          key={addr.id}
          address={addr}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteTarget(id)}
        />
      ))}

      {/* Add button (when addresses exist but form is hidden) */}
      {addresses.length > 0 && !showForm && (
        <button
          onClick={() => { setEditingAddress(null); setShowForm(true); }}
          className="w-full border-2 border-dashed border-stone-300 dark:border-stone-700
                     rounded-xl p-4 text-sm font-medium text-stone-500 dark:text-stone-400
                     hover:border-amber-400 dark:hover:border-amber-600
                     hover:text-amber-600 dark:hover:text-amber-400
                     transition-colors"
        >
          + Add New Address
        </button>
      )}

      {/* Address form */}
      {showForm && (
        <AddressForm
          initialData={editingAddress}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
      />
    </div>
  );
}
