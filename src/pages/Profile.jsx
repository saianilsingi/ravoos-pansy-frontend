import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";
import ProfileHeader from "../components/profile/ProfileHeader";
import QuickActions from "../components/profile/QuickActions";
import AddressManager from "../components/profile/AddressManager";

const TABS = [
  { key: "profile", label: "Profile", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )},
  { key: "addresses", label: "Addresses", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )},
];

export default function Profile() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    document.title = "Profile | Ravoos Pansy";
  }, []);

  // Guest view
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800
                        rounded-xl p-8 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-stone-200 dark:bg-stone-700
                          flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            Please login or signup to manage your account
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-2 rounded-lg
                         hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-lg
                         hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateName = async (newName) => {
    try {
      await api.put("auth/me/", { name: newName });
      await refreshUser();
      toast("Name updated!", "success");
      return true;
    } catch {
      toast("Failed to update name", "error");
      return false;
    }
  };

  const showTabs = user.role === "user";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <ProfileHeader user={user} onUpdateName={handleUpdateName} onLogout={logout} />

      {/* Tab navigation (user only — admins don't have addresses) */}
      {showTabs && (
        <div className="flex gap-1 bg-stone-100 dark:bg-stone-800/50 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md
                         text-sm font-medium transition-all duration-200
                         ${activeTab === tab.key
                           ? "bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-sm"
                           : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                         }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      {(!showTabs || activeTab === "profile") && (
        <QuickActions role={user.role} />
      )}

      {showTabs && activeTab === "addresses" && (
        <AddressManager />
      )}
    </div>
  );
}
