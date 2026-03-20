export default function AddressCard({ address, onEdit, onDelete }) {
  return (
    <div className={`bg-white dark:bg-stone-900 border rounded-xl p-4 shadow-sm transition-all
                     ${address.is_default
                       ? "border-amber-300 dark:border-amber-700 ring-1 ring-amber-200 dark:ring-amber-800/50"
                       : "border-stone-200 dark:border-stone-800"
                     }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-medium">{address.full_name}</p>
            {address.is_default && (
              <span className="text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/40
                               text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {address.street}{address.landmark ? `, ${address.landmark}` : ""}
          </p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {address.city}, {address.state} — {address.pincode}
          </p>
          {address.phone && (
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {address.phone}
            </p>
          )}
        </div>
        <div className="flex gap-3 text-sm shrink-0">
          <button
            onClick={() => onEdit(address)}
            className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(address.id)}
            className="text-red-500 dark:text-red-400 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
