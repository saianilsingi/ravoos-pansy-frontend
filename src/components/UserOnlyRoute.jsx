import { useContext, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function UserOnlyRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const hasHandled = useRef(false);

  // 🔑 derived states (no hooks here)
  const isGuest = !loading && !user;
  const isAdmin = !loading && user && user.role !== "user";

  // ✅ side-effects ALWAYS declared at top level
  useEffect(() => {
    if (isAdmin && !hasHandled.current) {
      hasHandled.current = true;
      alert("Cart is only available for users. Admins cannot purchase items.");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // ⏳ still checking auth
  if (loading) {
    return <p>Loading...</p>;
  }

  // Guest → login
  if (isGuest) {
    return <Navigate to="/login" />;
  }

  // Admin → redirect already triggered by effect
  if (isAdmin) {
    return null;
  }

  // User → allowed
  return children;
}
