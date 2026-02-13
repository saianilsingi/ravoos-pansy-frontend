import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import useDebounce from "../hooks/useDebounce";
import { SkeletonGrid } from "../components/Skeleton";

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
              <img
                src={product.image || FALLBACK_IMAGE}
                alt={product.name}
                className="w-full h-40 object-cover bg-stone-100 dark:bg-stone-800"
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
              />

              <div className="p-3 space-y-1">
                <h4 className="font-medium text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {product.name}
                </h4>
                <p className="font-semibold">₹{product.price}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {product.category?.name || "No Category"}
                </p>

                <button
                  onClick={(e) => handleAddToCart(e, product.id)}
                  className="w-full mt-2 bg-amber-600 dark:bg-amber-500 text-white py-2 rounded-lg
                             text-sm font-medium hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
