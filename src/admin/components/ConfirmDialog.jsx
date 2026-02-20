import Modal from "./Modal";

export default function ConfirmDialog({ open, onConfirm, onCancel, title = "Confirm Delete", message, confirmText = "Delete" }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="border border-stone-300 dark:border-stone-700 px-4 py-2 rounded-lg text-sm
                     hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium
                     hover:bg-red-700 dark:hover:bg-red-400 transition-colors"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
