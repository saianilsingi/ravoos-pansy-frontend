import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const FALLBACK_IMAGE =
  "https://dummyimage.com/400x300/e0e0e0/555&text=No+Image";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState(null);
  const toast = useToast();
  const { removeFromWishlist } = useWishlist();
  const { refreshCart } = useCart();

  useEffect(() => {
    document.title = "Wishlist | Ravoos Pansy";
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("wishlist/")
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .catch(() => {
        if (!cancelled) toast("Failed to load wishlist", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (wishlistItemId, productId) => {
    const success = await removeFromWishlist(wishlistItemId, productId);
    if (success) {
      setItems((prev) => prev.filter((item) => item.id !== wishlistItemId));
      toast("Removed from wishlist", "success");
    } else {
      toast("Failed to remove item", "error");
    }
  };

  const handleMoveToCart = async (wishlistItemId, productId) => {
    setMovingId(wishlistItemId);
    try {
      await api.post(`wishlist/${wishlistItemId}/move-to-cart/`);
      setItems((prev) => prev.filter((item) => item.id !== wishlistItemId));
      // Sync context: backend already deleted the wishlist item
      await removeFromWishlist(wishlistItemId, productId);
      await refreshCart();
      toast("Moved to cart!", "success");
    } catch (err) {
      toast(err.response?.data?.error || "Failed to move to cart", "error");
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Wishlist</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-4 p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
              <div className="w-24 h-24 bg-stone-200 dark:bg-stone-700 rounded-lg shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/4" />
                <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-2xl font-bold">Wishlist</h2>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 mx-auto text-stone-300 dark:text-stone-600 mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            Browse items and tap the heart icon to save them here.
          </p>
          <Link
            to="/items"
            className="bg-amber-600 dark:bg-amber-500 text-white px-6 py-3 rounded-lg
                       hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
          >
            Browse Items
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                         rounded-xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
            >
              <Link to={`/items/${item.product.id}`} className="shrink-0">
                <img
                  src={item.product.image || FALLBACK_IMAGE}
                  alt={item.product.name}
                  className={`w-24 h-24 object-cover rounded-lg bg-stone-100 dark:bg-stone-800 ${
                    item.product.stock === 0 ? "opacity-50" : ""
                  }`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
              </Link>

              <div className="flex-1 min-w-0 space-y-1">
                <Link
                  to={`/items/${item.product.id}`}
                  className="font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate block"
                >
                  {item.product.name}
                </Link>

                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  ₹{item.product.price}
                </p>

                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {item.product.category?.name || "No Category"}
                </p>

                {item.product.stock === 0 && (
                  <span className="inline-block text-xs text-red-500 font-semibold">
                    Out of Stock
                  </span>
                )}

                <div className="flex gap-2 pt-2">
                  {item.product.stock > 0 && (
                    <button
                      onClick={() => handleMoveToCart(item.id, item.product.id)}
                      disabled={movingId === item.id}
                      className="bg-amber-600 dark:bg-amber-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium
                                 hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {movingId === item.id ? "Moving..." : "Move to Cart"}
                    </button>
                  )}

                  <button
                    onClick={() => handleRemove(item.id, item.product.id)}
                    className="border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400
                               px-4 py-1.5 rounded-lg text-sm font-medium
                               hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
