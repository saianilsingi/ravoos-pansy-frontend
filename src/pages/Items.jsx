import { useEffect, useState, useContext, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

/* ── Sidebar Tree Node ── */
function TreeNode({ node, activePath, onSelect, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = activePath === node.full_slug;
  const isAncestor = activePath.startsWith(node.full_slug + "/");

  // Auto-expand if this node is an ancestor of the active category
  useEffect(() => {
    if (isAncestor) setExpanded(true);
  }, [isAncestor]);

  return (
    <div>
      <div className="flex items-center">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center text-stone-400 dark:text-stone-500
                       hover:text-stone-600 dark:hover:text-stone-300 shrink-0"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <button
          onClick={() => onSelect(node.full_slug)}
          className={`flex-1 text-left px-2 py-1.5 rounded-md text-sm transition-colors truncate ${
            isActive
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold"
              : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
          style={{ paddingLeft: `${depth * 8 + 8}px` }}
        >
          {node.name}
        </button>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              activePath={activePath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Breadcrumb ── */
function Breadcrumb({ breadcrumb, onSelect }) {
  if (!breadcrumb || breadcrumb.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap">
      <button
        onClick={() => onSelect("")}
        className="text-amber-600 dark:text-amber-400 hover:underline"
      >
        All
      </button>
      {breadcrumb.map((crumb, i) => {
        const path = breadcrumb
          .slice(0, i + 1)
          .map((c) => c.slug)
          .join("/");
        const isLast = i === breadcrumb.length - 1;
        return (
          <span key={crumb.id} className="flex items-center gap-1">
            <span className="text-stone-400 dark:text-stone-500">/</span>
            {isLast ? (
              <span className="font-medium text-stone-800 dark:text-stone-200">
                {crumb.name}
              </span>
            ) : (
              <button
                onClick={() => onSelect(path)}
                className="text-amber-600 dark:text-amber-400 hover:underline"
              >
                {crumb.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function Items() {
  const { "*": categoryPath } = useParams();
  const [categoryTree, setCategoryTree] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(categoryPath || "");
  const [activeBreadcrumb, setActiveBreadcrumb] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    document.title = "Items | Ravoos Pansy";
  }, []);

  // Sync URL param to state
  useEffect(() => {
    setActiveCategory(categoryPath || "");
  }, [categoryPath]);

  // Fetch category tree
  useEffect(() => {
    api
      .get("categories/tree/")
      .then((res) => setCategoryTree(res.data))
      .catch(() => toast("Failed to load categories", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch products
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
        if (!cancelled) {
          setProducts(res.data);
          // Extract breadcrumb from first product's category, or resolve from tree
          if (activeCategory && res.data.length > 0) {
            setActiveBreadcrumb(res.data[0].category?.breadcrumb || []);
          } else if (!activeCategory) {
            setActiveBreadcrumb([]);
          }
        }
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

  // Resolve breadcrumb when we have a category but no products
  useEffect(() => {
    if (activeCategory && products.length === 0 && !loading) {
      // Fetch the category directly to get breadcrumb
      api
        .get(`categories/?slug_path=${activeCategory}`)
        .catch(() => {});
    }
  }, [activeCategory, products.length, loading]);

  const handleSelectCategory = useCallback(
    (fullSlug) => {
      setSidebarOpen(false);
      if (fullSlug) {
        navigate(`/items/c/${fullSlug}`);
      } else {
        navigate("/items");
      }
    },
    [navigate]
  );

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* SIDEBAR — desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20 space-y-3">
            <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              Categories
            </h3>
            <button
              onClick={() => handleSelectCategory("")}
              className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                activeCategory === ""
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold"
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              All Items
            </button>
            {categoryTree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                activePath={activeCategory}
                onSelect={handleSelectCategory}
              />
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Mobile category toggle + search row */}
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden border border-stone-300 dark:border-stone-700 px-3 py-2.5 rounded-lg
                         text-sm font-medium text-stone-700 dark:text-stone-300
                         hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              Categories
            </button>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-stone-300 dark:border-stone-700
                         bg-white dark:bg-stone-900
                         rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400
                         placeholder:text-stone-400 dark:placeholder:text-stone-500
                         transition-colors"
            />
          </div>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="lg:hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                            rounded-xl p-4 space-y-2">
              <button
                onClick={() => handleSelectCategory("")}
                className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                  activeCategory === ""
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                All Items
              </button>
              {categoryTree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  activePath={activeCategory}
                  onSelect={handleSelectCategory}
                />
              ))}
            </div>
          )}

          {/* Breadcrumb */}
          {activeCategory && (
            <Breadcrumb breadcrumb={activeBreadcrumb} onSelect={handleSelectCategory} />
          )}

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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
