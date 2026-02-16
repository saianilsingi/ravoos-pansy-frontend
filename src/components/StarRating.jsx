export default function StarRating({ rating = 0, count, size = "text-sm" }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className={`inline-flex items-center gap-1 ${size}`}>
      <span className="text-amber-500 dark:text-amber-400 tracking-tight">
        {"★".repeat(full)}
        {half && "½"}
        {"☆".repeat(empty)}
      </span>
      {rating > 0 && (
        <span className="text-stone-500 dark:text-stone-400 font-medium">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count != null && count > 0 && (
        <span className="text-stone-400 dark:text-stone-500">
          ({count})
        </span>
      )}
    </span>
  );
}
