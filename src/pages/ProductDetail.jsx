import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";
import StarRatingInput from "../components/StarRatingInput";
import ReviewCard from "../components/ReviewCard";

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

  // Review state
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [editingReview, setEditingReview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

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

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    api
      .get(`products/${id}/reviews/`)
      .then((res) => setReviews(res.data.results || res.data))
      .catch(() => {});
  }, [id]);

  // Check if user can review
  useEffect(() => {
    if (!user || user.role !== "user") return;
    api
      .get(`products/${id}/reviews/can-review/`)
      .then((res) => setCanReview(res.data.can_review))
      .catch(() => setCanReview(false));
  }, [id, user]);

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

  const submitReview = async () => {
    if (reviewForm.rating === 0) {
      toast("Please select a rating", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      if (editingReview) {
        const res = await api.put(`reviews/${editingReview.id}/`, {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        setReviews((prev) =>
          prev.map((r) => (r.id === editingReview.id ? res.data : r))
        );
        toast("Review updated!", "success");
      } else {
        const res = await api.post(`products/${id}/reviews/create/`, {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        setReviews((prev) => [res.data, ...prev]);
        setCanReview(false);
        toast("Review submitted!", "success");
      }
      setReviewForm({ rating: 0, comment: "" });
      setEditingReview(null);
      // Refresh product to get updated avg_rating/review_count
      api.get(`products/${id}/`).then((res) => setProduct(res.data));
    } catch (err) {
      toast(err.response?.data?.error || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({ rating: review.rating, comment: review.comment });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api.delete(`reviews/${reviewId}/delete/`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setCanReview(true);
      toast("Review deleted", "success");
      api.get(`products/${id}/`).then((res) => setProduct(res.data));
    } catch {
      toast("Failed to delete review", "error");
    }
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <div>
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
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE;
            }}
          />

          {/* INFO */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>

            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{product.price}
            </p>

            <StarRating
              rating={product.avg_rating}
              count={product.review_count}
              size="text-base"
            />

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

      {/* REVIEWS SECTION */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">
          Reviews {product.review_count > 0 && `(${product.review_count})`}
        </h2>

        {/* REVIEW FORM */}
        {(canReview || editingReview) && (
          <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm">
              {editingReview ? "Edit your review" : "Write a review"}
            </h3>

            <StarRatingInput
              value={reviewForm.rating}
              onChange={(val) => setReviewForm({ ...reviewForm, rating: val })}
            />

            <textarea
              placeholder="Share your experience (optional)"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              rows={3}
              className="w-full border border-stone-300 dark:border-stone-700
                         bg-white dark:bg-stone-900 rounded-lg px-4 py-2
                         text-sm transition-colors"
            />

            <div className="flex gap-3">
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium
                           hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview
                  ? "Submitting..."
                  : editingReview
                    ? "Update Review"
                    : "Submit Review"}
              </button>
              {editingReview && (
                <button
                  onClick={() => {
                    setEditingReview(null);
                    setReviewForm({ rating: 0, comment: "" });
                  }}
                  className="border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-lg text-sm
                             hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* REVIEW LIST */}
        {reviews.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
