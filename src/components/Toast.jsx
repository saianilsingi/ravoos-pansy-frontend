const TYPE_STYLES = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-amber-600 dark:bg-amber-500 text-white",
};

export default function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-1.5rem)] sm:max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm animate-toast-in ${
            TYPE_STYLES[t.type] || TYPE_STYLES.info
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
