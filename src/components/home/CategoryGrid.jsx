import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { title: "Food",    emoji: "🍕", slug: "food",    color: "from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5" },
  { title: "Drinks",  emoji: "🧃", slug: "drinks",  color: "from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5" },
  { title: "Clothes", emoji: "👕", slug: "clothes", color: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5" },
  { title: "Gaming",  emoji: "🎮", slug: "gaming",  color: "from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5" },
];

export default function CategoryGrid() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => navigate(`/items?category=${cat.slug}`)}
            className={`bg-gradient-to-br ${cat.color}
                       bg-white dark:bg-stone-900
                       border border-stone-200 dark:border-stone-800
                       rounded-xl p-6 text-center cursor-pointer
                       hover:border-amber-400 dark:hover:border-amber-600
                       hover:shadow-lg hover:-translate-y-0.5
                       transition-all duration-300 group`}
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {cat.emoji}
            </div>
            <h3 className="font-semibold text-lg">{cat.title}</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1
                          group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Explore →
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
