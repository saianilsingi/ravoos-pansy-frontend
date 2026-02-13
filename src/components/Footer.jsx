import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">

        {/* BRAND */}
        <div>
          <h3 className="text-white font-bold text-lg">
            Ravoos Pansy
          </h3>
          <p className="text-sm mt-2 text-stone-400">
            Food · Drinks · Clothes · Gaming
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h4 className="text-white font-semibold mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/items" className="hover:underline">Items</Link></li>
            <li><Link to="/profile" className="hover:underline">Profile</Link></li>
          </ul>
        </div>

        {/* INFO */}
        <div>
          <h4 className="text-white font-semibold mb-3">
            About
          </h4>
          <p className="text-sm text-stone-400">
            Built as a full-stack learning project using Django & React.
          </p>
        </div>
      </div>

      <div className="border-t border-stone-700 text-center text-sm py-4 text-stone-400">
        © {new Date().getFullYear()} Ravoos Pansy
      </div>
    </footer>
  );
}
