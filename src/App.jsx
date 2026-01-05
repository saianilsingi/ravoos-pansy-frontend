import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Items from "./pages/Items";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import UserOnlyRoute from "./components/UserOnlyRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard"
import Layout from "./components/Layout";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC PAGES WITH LAYOUT */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/items"
          element={
            <Layout>
              <Items />
            </Layout>
          }
        />

        {/* USER-ONLY PAGE */}
        <Route
          path="/cart"
          element={
            <UserOnlyRoute>
              <Layout>
                <Cart />
              </Layout>
            </UserOnlyRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/checkout"
            element={
              <UserOnlyRoute>
                <Layout>
                  <Checkout />
                </Layout>
              </UserOnlyRoute>
          }
        />

        <Route
        path="/orders"
            element={
            <UserOnlyRoute>
              <Layout>
                <Orders />
              </Layout>
            </UserOnlyRoute>
          }
        />

<Route
  path="/admin-panel"
  element={
    <AdminRoute>
      <Layout>
        <AdminDashboard />
      </Layout>
    </AdminRoute>
  }
/>


        {/* AUTH PAGES (NO NAVBAR) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </BrowserRouter>
  );
}
