import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { SkeletonCard } from "../Skeleton";

export default function ProductSection({ title, products, link, loading, scrollable }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-48 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
          <div className="h-4 w-16 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {link && (
          <button
            onClick={() => navigate(link)}
            className="text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium"
          >
            See all →
          </button>
        )}
      </div>

      {/* Product grid — horizontally scrollable on mobile if scrollable=true */}
      {scrollable ? (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory
                        scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700
                        -mx-4 px-4 sm:mx-0 sm:px-0
                        sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
          {products.map((p) => (
            <div key={p.id} className="min-w-[200px] sm:min-w-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
