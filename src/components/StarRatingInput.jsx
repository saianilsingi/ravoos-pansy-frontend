import { useState } from "react";

export default function StarRatingInput({ value = 0, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`text-2xl transition-colors ${
            star <= (hover || value)
              ? "text-amber-500 dark:text-amber-400"
              : "text-stone-300 dark:text-stone-600"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
