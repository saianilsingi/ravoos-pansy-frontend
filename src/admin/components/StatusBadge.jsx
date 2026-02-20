const ORDER_COLORS = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  placed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  packing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  out_for_delivery: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const COUPON_COLORS = {
  true: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  false: "bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-400",
};

export default function StatusBadge({ status, type = "order" }) {
  let colorClass, label;

  if (type === "order") {
    colorClass = ORDER_COLORS[status] || "bg-stone-200 text-stone-500";
    label = status.replace(/_/g, " ");
  } else {
    const isActive = status === true || status === "active";
    colorClass = COUPON_COLORS[isActive];
    label = isActive ? "Active" : "Inactive";
  }

  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium capitalize ${colorClass}`}>
      {label}
    </span>
  );
}
