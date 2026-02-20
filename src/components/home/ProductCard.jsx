import { Link } from "react-router-dom";
import StarRating from "../StarRating";
import { formatCurrency, isNewProduct } from "../../utils/format";

export default function ProductCard({ product }) {
  const isNew = isNewProduct(product.created_at);
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      to={`/items/${product.id}`}
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                 rounded-xl overflow-hidden
                 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700
                 hover:-translate-y-0.5
                 transition-all duration-300 group flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.image || "https://dummyimage.com/300x200/e0e0e0/555&text=No+Image"}
          alt={product.name}
          loading="lazy"
          className="h-36 sm:h-44 w-full object-cover
                     group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              NEW
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              SOLD OUT
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              LOW STOCK
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="font-medium text-sm truncate
                       group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {product.name}
        </h4>
        <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm mt-1">
          {formatCurrency(product.price)}
        </p>
        {Number(product.avg_rating) > 0 && (
          <div className="mt-auto pt-1.5">
            <StarRating rating={product.avg_rating} count={product.review_count} size="text-xs" />
          </div>
        )}
      </div>
    </Link>
  );
}
