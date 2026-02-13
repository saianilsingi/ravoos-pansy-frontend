export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 animate-pulse">
      <div className="h-40 bg-stone-200 dark:bg-stone-700 rounded-lg mb-3" />
      <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
    </div>
  );
}

export function SkeletonLine({ width = "w-full" }) {
  return <div className={`h-4 bg-stone-200 dark:bg-stone-700 rounded ${width} animate-pulse`} />;
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
