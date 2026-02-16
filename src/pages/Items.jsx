import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import useDebounce from "../hooks/useDebounce";
import { SkeletonGrid } from "../components/Skeleton";
import StarRating from "../components/StarRating";

const FALLBACK_IMAGE =
  "https://dummyimage.com/400x300/e0e0e0/555&text=No+Image";

export default function Items() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || ""
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 400);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    document.title = "Items | Ravoos Pansy";
  }, []);

  // Fetch categories
  useEffect(() => {
    api
      .get("categories/")
      .then((res) => setCategories(res.data))
      .catch(() => toast("Failed to load categories", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch products (debounced search)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    let url = "products/";
    const params = [];

    if (activeCategory) params.push(`category=${activeCategory}`);
    if (debouncedSearch) params.push(`search=${debouncedSearch}`);

    if (params.length) {
      url += "?" + params.join("&");
    }

    api
      .get(url)
      .then((res) => {
        if (!cancelled) setProducts(res.data);
      })
      .catch(() => {
        if (!cancelled) toast("Failed to load products", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, debouncedSearch]);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      toast("Admins cannot purchase products", "error");
      return;
    }

    const success = await addToCart(productId);
    toast(success ? "Added to cart!" : "Failed to add to cart", success ? "success" : "error");
  };

  const handleToggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      toast("Admins cannot use wishlist", "error");
      return;
    }

    const result = await toggleWishlist(productId);
    if (result === "added") toast("Added to wishlist", "success");
    else if (result === "removed") toast("Removed from wishlist", "success");
    else toast("Failed to update wishlist", "error");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-2xl font-bold">Items</h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-stone-300 dark:border-stone-700
                   bg-white dark:bg-stone-900
                   rounded-lg px-4 py-2.5
                   focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400
                   placeholder:text-stone-400 dark:placeholder:text-stone-500
                   transition-colors"
      />

      {/* CATEGORY FILTERS */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === ""
              ? "bg-amber-600 dark:bg-amber-500 text-white shadow-md"
              : "bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-400 dark:hover:border-amber-600"
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.slug
                ? "bg-amber-600 dark:bg-amber-500 text-white shadow-md"
                : "bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-400 dark:hover:border-amber-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* PRODUCTS */}
      {loading ? (
        <SkeletonGrid />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-stone-500 dark:text-stone-400">
            Try a different search or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              to={`/items/${product.id}`}
              key={product.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                         rounded-xl overflow-hidden
                         hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700
                         transition-all group"
            >
              <div className="relative">
                <img
                  src={product.image || FALLBACK_IMAGE}
                  alt={product.name}
                  className={`w-full h-40 object-cover bg-stone-100 dark:bg-stone-800 ${
                    product.stock === 0 ? "opacity-50" : ""
                  }`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
                {product.stock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
                {user?.role === "user" && (
                  <button
                    onClick={(e) => handleToggleWishlist(e, product.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm
                               hover:bg-white dark:hover:bg-stone-800 transition-colors shadow-sm"
                    aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill={isWishlisted(product.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        className={isWishlisted(product.id) ? "text-red-500" : "text-stone-600 dark:text-stone-300"}
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="p-3 space-y-1">
                <h4 className="font-medium text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {product.name}
                </h4>
                <p className="font-semibold">₹{product.price}</p>
                {Number(product.avg_rating) > 0 && (
                  <StarRating rating={product.avg_rating} count={product.review_count} size="text-xs" />
                )}
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {product.category?.name || "No Category"}
                </p>

                {product.stock > 0 ? (
                  <button
                    onClick={(e) => handleAddToCart(e, product.id)}
                    className="w-full mt-2 bg-amber-600 dark:bg-amber-500 text-white py-2 rounded-lg
                               text-sm font-medium hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full mt-2 bg-stone-300 dark:bg-stone-700 text-stone-500 dark:text-stone-400 py-2 rounded-lg
                               text-sm font-medium cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
