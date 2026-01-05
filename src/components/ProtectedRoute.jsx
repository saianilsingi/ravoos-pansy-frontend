import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Allows ONLY logged-in normal users
 * Blocks guest and admin
 */
export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  // Guest → login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Admin → block (redirect to home or profile)
  if (user.role === "admin") {
    return <Navigate to="/" />;
  }

  // Normal user → allowed
  return children;
}

