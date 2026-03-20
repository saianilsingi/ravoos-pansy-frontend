import { useState } from "react";

export default function ProfileHeader({ user, onUpdateName, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const initials = (user.name || user.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    const success = await onUpdateName(name);
    setSaving(false);
    if (success) setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user.name || "");
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                    rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200
                        dark:from-amber-900/40 dark:to-amber-800/40
                        flex items-center justify-center shrink-0 shadow-inner">
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {initials}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          {editing ? (
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
                autoFocus
              />
              <div className="flex gap-3 justify-center sm:justify-start">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                             hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors text-sm font-medium
                             disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-lg
                             hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                <h2 className="text-xl font-bold">{user.name || "User"}</h2>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  user.role === "admin"
                    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                    : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                }`}>
                  {user.role === "admin" ? "Admin" : "Customer"}
                </span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">{user.email}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-amber-600 dark:text-amber-400 text-sm font-medium hover:underline mt-2"
              >
                Edit name
              </button>
            </>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="text-sm text-red-500 dark:text-red-400 hover:underline shrink-0"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
