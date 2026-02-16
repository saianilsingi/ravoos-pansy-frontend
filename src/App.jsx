import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminRoute from "./components/AdminRoute";
import UserOnlyRoute from "./components/UserOnlyRoute";

const Home = lazy(() => import("./pages/Home"));
const Items = lazy(() => import("./pages/Items"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Profile = lazy(() => import("./pages/Profile"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-stone-400 dark:text-stone-500">Loading...</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/items" element={<Layout><Items /></Layout>} />
          <Route path="/items/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />

          {/* User-only pages */}
          <Route path="/wishlist" element={<UserOnlyRoute><Layout><Wishlist /></Layout></UserOnlyRoute>} />
          <Route path="/cart" element={<UserOnlyRoute><Layout><Cart /></Layout></UserOnlyRoute>} />
          <Route path="/checkout" element={<UserOnlyRoute><Layout><Checkout /></Layout></UserOnlyRoute>} />
          <Route path="/orders" element={<UserOnlyRoute><Layout><Orders /></Layout></UserOnlyRoute>} />

          {/* Admin-only */}
          <Route path="/admin-panel" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />

          {/* Auth pages (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 404 catch-all */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
