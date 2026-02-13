import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";

const FALLBACK_IMAGE =
  "https://dummyimage.com/600x400/e0e0e0/555&text=No+Image";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    api
      .get(`products/${id}/`)
      .then((res) => {
        setProduct(res.data);
        document.title = res.data.name + " | Ravoos Pansy";
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
          document.title = "Product Not Found | Ravoos Pansy";
        } else {
          toast("Failed to load product", "error");
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "user") {
      toast("Admins cannot purchase products", "error");
      return;
    }
    const success = await addToCart(product.id);
    toast(success ? "Added to cart!" : "Failed to add to cart", success ? "success" : "error");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-24" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-80 bg-stone-200 dark:bg-stone-700 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
              <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/4" />
              <div className="h-20 bg-stone-200 dark:bg-stone-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-semibold mb-2">Product not found</h2>
        <p className="text-stone-500 dark:text-stone-400 mb-6">
          This product may have been removed or does not exist.
        </p>
        <Link
          to="/items"
          className="bg-amber-600 dark:bg-amber-500 text-white px-6 py-3 rounded-lg
                     hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
        >
          Browse Items
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/items"
        className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium"
      >
        ← Back to Items
      </Link>

      <div className="mt-6 grid md:grid-cols-2 gap-6 md:gap-8">
        {/* IMAGE */}
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          className="w-full h-60 sm:h-80 object-cover rounded-xl bg-stone-100 dark:bg-stone-800"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
          }}
        />

        {/* INFO */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>

          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            ₹{product.price}
          </p>

          <p className="text-sm text-stone-500 dark:text-stone-400">
            {product.category?.name || "No Category"}
          </p>

          <p className="text-stone-700 dark:text-stone-300">
            {product.description || "No description available."}
          </p>

          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto bg-amber-600 dark:bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold
                       hover:bg-amber-700 dark:hover:bg-amber-400 shadow-md hover:shadow-lg transition-all"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
