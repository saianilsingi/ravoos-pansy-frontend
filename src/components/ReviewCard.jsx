import StarRating from "./StarRating";

export default function ReviewCard({ review, onEdit, onDelete }) {
  const date = new Date(review.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="border border-stone-200 dark:border-stone-800 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{review.user_name}</span>
          <StarRating rating={review.rating} />
        </div>
        <span className="text-xs text-stone-400 dark:text-stone-500">{date}</span>
      </div>

      {review.comment && (
        <p className="text-sm text-stone-700 dark:text-stone-300">{review.comment}</p>
      )}

      {review.is_own && (
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onEdit(review)}
            className="text-amber-600 dark:text-amber-400 text-xs hover:underline font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(review.id)}
            className="text-red-500 dark:text-red-400 text-xs hover:underline"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
