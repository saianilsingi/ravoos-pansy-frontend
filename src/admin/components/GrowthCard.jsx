export default function GrowthCard({ label, current, previous, growth, prefix = "" }) {
  const isPositive = growth > 0;
  const isZero = growth === 0;
  const arrow = isPositive ? "↑" : isZero ? "→" : "↓";
  const growthColor = isPositive
    ? "text-green-600 dark:text-green-400"
    : isZero
      ? "text-stone-500 dark:text-stone-400"
      : "text-red-500 dark:text-red-400";

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-2">
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">
          {prefix}{typeof current === "number" && !prefix ? current : Number(current).toLocaleString("en-IN")}
        </span>
        <span className={`text-sm font-semibold ${growthColor}`}>
          {arrow} {Math.abs(growth).toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-stone-400 dark:text-stone-500">
        vs prev 30d: {prefix}{typeof previous === "number" && !prefix ? previous : Number(previous).toLocaleString("en-IN")}
      </p>
    </div>
  );
}
