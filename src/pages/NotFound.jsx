import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found | Ravoos Pansy";
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-amber-600 dark:text-amber-400 mb-4">
        404
      </h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-stone-500 dark:text-stone-400 mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-amber-600 dark:bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold
                   hover:bg-amber-700 dark:hover:bg-amber-400 shadow-md hover:shadow-lg transition-all"
      >
        Go Home
      </Link>
    </div>
  );
}
