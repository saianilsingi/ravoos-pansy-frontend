export default function StatCard({ label, value, color = "text-stone-900 dark:text-stone-100", sub }) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-1">
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-stone-400 dark:text-stone-500">{sub}</p>}
    </div>
  );
}
