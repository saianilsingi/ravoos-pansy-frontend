import { useState } from "react";

const FIELD_CONFIG = [
  { key: "full_name", label: "Full Name", span: 1 },
  { key: "phone",     label: "Phone",     span: 1 },
  { key: "street",    label: "Street Address", span: 2 },
  { key: "city",      label: "City",      span: 1 },
  { key: "state",     label: "State",     span: 1 },
  { key: "pincode",   label: "Pincode",   span: 1 },
  { key: "landmark",  label: "Landmark",  span: 1 },
];

const EMPTY_FORM = {
  full_name: "", phone: "", street: "", city: "",
  state: "", pincode: "", landmark: "", is_default: false,
};

export default function AddressForm({ initialData, onSave, onCancel }) {
  const isEditing = !!initialData?.id;
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form, isEditing ? initialData.id : null);
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                 rounded-xl p-5 shadow-sm space-y-4"
    >
      <h4 className="font-semibold">
        {isEditing ? "Edit Address" : "Add New Address"}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELD_CONFIG.map(({ key, label, span }) => (
          <div key={key} className={span === 2 ? "sm:col-span-2" : ""}>
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">
              {label}
            </label>
            <input
              name={key}
              placeholder={label}
              value={form[key]}
              onChange={handleChange}
              className="w-full border border-stone-300 dark:border-stone-700
                         bg-white dark:bg-stone-800 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400
                         placeholder:text-stone-400 dark:placeholder:text-stone-500
                         transition-colors text-sm"
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
          type="submit"
          disabled={saving}
          className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                     hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors text-sm font-medium
                     disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing ? "Update Address" : "Add Address"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-lg
                       hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
