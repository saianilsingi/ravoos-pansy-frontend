import { useNavigate } from "react-router-dom";

const USER_ACTIONS = [
  { emoji: "📦", title: "My Orders",    desc: "Track and manage your orders", path: "/orders" },
  { emoji: "🛍️", title: "Browse Items", desc: "Explore our collection",       path: "/items" },
];

const ADMIN_ACTIONS = [
  { emoji: "⚙️", title: "Admin Panel",    desc: "Manage products, orders & coupons", path: "/admin" },
  { emoji: "🛍️", title: "View Storefront", desc: "See the customer-facing store",    path: "/items" },
];

function ActionCard({ emoji, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                 rounded-xl p-5 shadow-sm text-left
                 hover:border-amber-400 dark:hover:border-amber-600
                 hover:shadow-md hover:-translate-y-0.5
                 transition-all duration-300 group"
    >
      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
        {emoji}
      </div>
      <h3 className="font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{desc}</p>
    </button>
  );
}

export default function QuickActions({ role }) {
  const navigate = useNavigate();
  const actions = role === "admin" ? ADMIN_ACTIONS : USER_ACTIONS;

  return (
    <div className={`grid gap-4 ${actions.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
      {actions.map((a) => (
        <ActionCard key={a.path + a.title} {...a} onClick={() => navigate(a.path)} />
      ))}
    </div>
  );
}
