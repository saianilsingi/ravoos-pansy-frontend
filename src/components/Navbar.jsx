import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="font-bold text-lg text-indigo-600">
            Ravoos Pansy
          </span>
          <span className="text-xs text-gray-500 hidden sm:block">
            Food · Drinks · Clothes · Gaming
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/items" className="hover:text-indigo-600">Items</Link>

          {user?.role === "user" && (
            <Link to="/cart" className="hover:text-indigo-600">Cart</Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin-panel" className="hover:text-indigo-600">
              Admin
            </Link>
          )}

          {!user && (
            <>
              <Link to="/login" className="hover:text-indigo-600">Login</Link>
              <Link to="/signup" className="hover:text-indigo-600">Signup</Link>
            </>
          )}

          {user && (
            <>
              <Link to="/profile" className="hover:text-indigo-600">
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-red-500 hover:underline"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3 text-sm">
          <Link to="/items" className="block">Items</Link>

          {user?.role === "user" && <Link to="/cart" className="block">Cart</Link>}
          {user?.role === "admin" && <Link to="/admin-panel" className="block">Admin</Link>}

          {!user && (
            <>
              <Link to="/login" className="block">Login</Link>
              <Link to="/signup" className="block">Signup</Link>
            </>
          )}

          {user && (
            <>
              <Link to="/profile" className="block">Profile</Link>
              <button
                onClick={logout}
                className="block text-red-500"
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
