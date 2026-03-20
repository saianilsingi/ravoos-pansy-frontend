const STATUS_COLORS = {
  pending: "bg-yellow-400",
  placed: "bg-blue-400",
  packing: "bg-indigo-400",
  shipped: "bg-purple-400",
  out_for_delivery: "bg-cyan-400",
  delivered: "bg-green-500",
  cancelled: "bg-red-400",
};

export default function StatusBar({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.status} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="capitalize font-medium text-stone-700 dark:text-stone-300">
              {item.status.replace(/_/g, " ")}
            </span>
            <span className="text-stone-500 dark:text-stone-400">{item.count}</span>
          </div>
          <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${STATUS_COLORS[item.status] || "bg-stone-400"}`}
              style={{ width: `${(item.count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
