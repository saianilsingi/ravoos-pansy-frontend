import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { SkeletonGrid } from "../components/Skeleton";

export default function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Ravoos Pansy";
  }, []);

  useEffect(() => {
    api
      .get("products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 8);
  const foodItems = products
    .filter((p) => p.category?.slug === "food")
    .slice(0, 4);
  const gamingItems = products
    .filter((p) => p.category?.slug === "gaming")
    .slice(0, 4);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <SkeletonGrid count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-20">
      {/* HERO */}
      <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500
                          dark:from-amber-900 dark:via-orange-900 dark:to-rose-900
                          text-white py-24 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Ravoos Pansy
          </h1>
          <p className="text-lg text-white/80 dark:text-stone-300 mb-8">
            Food · Drinks · Clothes · Gaming
          </p>
          <button
            onClick={() => navigate("/items")}
            className="bg-white dark:bg-amber-500 text-amber-700 dark:text-white
                       px-8 py-3 rounded-full font-bold text-lg
                       shadow-lg hover:shadow-xl hover:scale-105
                       hover:bg-amber-50 dark:hover:bg-amber-400
                       transition-all duration-200"
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* CATEGORY SHORTCUTS */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <CategoryCard title="Food" emoji="🍕" onClick={() => navigate("/items?category=food")} />
          <CategoryCard title="Drinks" emoji="🧃" onClick={() => navigate("/items?category=drinks")} />
          <CategoryCard title="Clothes" emoji="👕" onClick={() => navigate("/items?category=clothes")} />
          <CategoryCard title="Gaming" emoji="🎮" onClick={() => navigate("/items?category=gaming")} />
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionHeader title="Featured Products" onSeeAll={() => navigate("/items")} />
        <HorizontalList items={featured} />
      </section>

      {/* FOOD PREVIEW */}
      {foodItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <SectionHeader title="Food Picks" onSeeAll={() => navigate("/items?category=food")} />
          <HorizontalList items={foodItems} />
        </section>
      )}

      {/* GAMING PREVIEW */}
      {gamingItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <SectionHeader title="Gaming Essentials" onSeeAll={() => navigate("/items?category=gaming")} />
          <HorizontalList items={gamingItems} />
        </section>
      )}

      {/* OFFER BANNER */}
      <section className="bg-amber-50 dark:bg-stone-900 border-y border-amber-200 dark:border-stone-800 py-14 text-center">
        <h2 className="text-2xl font-bold mb-2">Special Offers</h2>
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          Flat ₹100 off on your first order
        </p>
        <button
          onClick={() => navigate("/items")}
          className="bg-amber-600 text-white px-8 py-3 rounded-full font-semibold
                     hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400
                     shadow-md hover:shadow-lg transition-all"
        >
          Explore Deals
        </button>
      </section>
    </div>
  );
}

/* ---------------- LOCAL COMPONENTS ---------------- */

function CategoryCard({ title, emoji, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                 rounded-xl p-6 text-center cursor-pointer
                 hover:border-amber-400 dark:hover:border-amber-600
                 hover:shadow-md transition-all group"
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        Explore →
      </p>
    </div>
  );
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <button
        onClick={onSeeAll}
        className="text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium"
      >
        See all →
      </button>
    </div>
  );
}

function HorizontalList({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Link
          to={`/items/${item.id}`}
          key={item.id}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                     rounded-xl p-3 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700
                     transition-all group"
        >
          <img
            src={item.image || "https://via.placeholder.com/300"}
            alt={item.name}
            className="h-28 w-full object-cover rounded-lg mb-3"
          />
          <h4 className="font-medium text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {item.name}
          </h4>
          <p className="text-stone-500 dark:text-stone-400 text-sm">₹{item.price}</p>
        </Link>
      ))}
    </div>
  );
}
