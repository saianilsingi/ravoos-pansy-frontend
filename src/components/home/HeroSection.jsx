import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden isolate">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500
                      dark:from-amber-900 dark:via-orange-900 dark:to-rose-900" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10"
           style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      {/* Gradient fade at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-50 dark:from-stone-950 to-transparent" />

      <div className="relative z-10 py-28 md:py-36 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight
                       animate-fade-in-up">
          Ravoos Pansy
        </h1>
        <p className="text-lg md:text-xl text-white/80 dark:text-stone-300 mb-10 max-w-xl mx-auto">
          Premium Food, Drinks, Clothes &amp; Gaming — all in one place
        </p>
        <button
          onClick={() => navigate("/items")}
          className="bg-white dark:bg-amber-500 text-amber-700 dark:text-white
                     px-10 py-3.5 rounded-full font-bold text-lg
                     shadow-lg hover:shadow-xl hover:scale-105
                     hover:bg-amber-50 dark:hover:bg-amber-400
                     transition-all duration-300 ease-out"
        >
          Shop Now
        </button>
      </div>
    </section>
  );
}
