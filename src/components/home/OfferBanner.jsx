import { useNavigate } from "react-router-dom";

export default function OfferBanner() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      <div className="bg-amber-50 dark:bg-stone-900 border-y border-amber-200 dark:border-stone-800
                      py-16 text-center px-4">
        {/* Decorative circles */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full
                        bg-amber-200/30 dark:bg-amber-800/10 blur-2xl" />
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full
                        bg-orange-200/30 dark:bg-orange-800/10 blur-2xl" />

        <div className="relative z-10">
          <span className="inline-block bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300
                           text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            Limited Offer
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Flat ₹100 Off Your First Order
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-md mx-auto">
            Sign up today and get ₹100 off on your very first purchase. No minimum order required.
          </p>
          <button
            onClick={() => navigate("/items")}
            className="bg-amber-600 text-white px-10 py-3 rounded-full font-semibold
                       hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400
                       shadow-md hover:shadow-lg hover:scale-105
                       transition-all duration-300"
          >
            Explore Deals
          </button>
        </div>
      </div>
    </section>
  );
}
