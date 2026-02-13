import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 dark:border-stone-800
                    bg-white/80 dark:bg-stone-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="font-bold text-lg text-amber-600 dark:text-amber-400">
            Ravoos Pansy
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
            Food · Drinks · Clothes · Gaming
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium
                        text-stone-700 dark:text-stone-300">
          <Link to="/items" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Items
          </Link>

          {user?.role === "user" && (
            <Link to="/cart" className="relative hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-amber-600 dark:bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin-panel" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Admin
            </Link>
          )}

          {!user && (
            <>
              <Link to="/login" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-amber-600 text-white px-4 py-1.5 rounded-lg
                           hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 transition-colors"
              >
                Signup
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to="/profile" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-red-500 dark:text-red-400 hover:underline"
              >
                Logout
              </button>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* MOBILE BUTTONS */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 text-lg"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="text-2xl p-2"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800
                        bg-white dark:bg-stone-900 px-4 py-3 space-y-1">
          <Link to="/items" className="block py-2 text-stone-700 dark:text-stone-300" onClick={closeMenu}>
            Items
          </Link>

          {user?.role === "user" && (
            <Link to="/cart" className="py-2 text-stone-700 dark:text-stone-300 flex items-center gap-2" onClick={closeMenu}>
              Cart
              {cartCount > 0 && (
                <span className="bg-amber-600 dark:bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full inline-flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin-panel" className="block py-2 text-stone-700 dark:text-stone-300" onClick={closeMenu}>
              Admin
            </Link>
          )}

          {!user && (
            <>
              <Link to="/login" className="block py-2 text-stone-700 dark:text-stone-300" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/signup" className="block py-2 text-amber-600 dark:text-amber-400 font-medium" onClick={closeMenu}>
                Signup
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to="/profile" className="block py-2 text-stone-700 dark:text-stone-300" onClick={closeMenu}>
                Profile
              </Link>
              <button
                onClick={() => { logout(); closeMenu(); }}
                className="block py-2 text-red-500 dark:text-red-400"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
