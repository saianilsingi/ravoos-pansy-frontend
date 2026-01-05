import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("products/")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 8);
  const foodItems = products.filter(p => p.category.slug === "food").slice(0, 4);
  const gamingItems = products.filter(p => p.category.slug === "gaming").slice(0, 4);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-500">
        Loading home...
      </div>
    );
  }

  return (
    <div className="space-y-20">

      {/* HERO */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Ravoos Pansy
        </h1>
        <p className="opacity-90 mb-6">
          Food · Drinks · Clothes · Gaming
        </p>
        <button
          onClick={() => navigate("/items")}
          className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
        >
          Shop Now
        </button>
      </section>

      {/* CATEGORY SHORTCUTS */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <CategoryCard title="Food" onClick={() => navigate("/items?category=food")} />
          <CategoryCard title="Drinks" onClick={() => navigate("/items?category=drinks")} />
          <CategoryCard title="Clothes" onClick={() => navigate("/items?category=clothes")} />
          <CategoryCard title="Gaming" onClick={() => navigate("/items?category=gaming")} />
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionHeader
          title="🔥 Featured Products"
          onSeeAll={() => navigate("/items")}
        />
        <HorizontalList items={featured} />
      </section>

      {/* FOOD PREVIEW */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionHeader
          title="🍔 Food Picks"
          onSeeAll={() => navigate("/items?category=food")}
        />
        <HorizontalList items={foodItems} />
      </section>

      {/* GAMING PREVIEW */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionHeader
          title="🎮 Gaming Essentials"
          onSeeAll={() => navigate("/items?category=gaming")}
        />
        <HorizontalList items={gamingItems} />
      </section>

      {/* OFFER */}
      <section className="bg-gray-100 py-14 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          🎉 Special Offers
        </h2>
        <p className="text-gray-600 mb-4">
          Flat ₹100 off on your first order
        </p>
        <button
          onClick={() => navigate("/items")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition"
        >
          Explore Deals
        </button>
      </section>

    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function CategoryCard({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-6 text-center cursor-pointer
                 hover:shadow-md transition"
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">Explore →</p>
    </div>
  );
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button
        onClick={onSeeAll}
        className="text-sm text-indigo-600 hover:underline"
      >
        See all →
      </button>
    </div>
  );
}

function HorizontalList({ items }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {items.map(item => (
        <div
          key={item.id}
          className="min-w-[180px] bg-white border border-gray-200 rounded-lg
                     p-3 hover:shadow-md transition"
        >
          <img
            src={item.image || "https://via.placeholder.com/300"}
            alt={item.name}
            className="h-28 w-full object-cover rounded-md mb-3"
          />
          <h4 className="font-medium text-sm truncate">
            {item.name}
          </h4>
          <p className="text-gray-600 text-sm">
            ₹{item.price}
          </p>
        </div>
      ))}
    </div>
  );
}
