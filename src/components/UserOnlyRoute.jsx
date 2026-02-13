import { useContext, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function UserOnlyRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const hasHandled = useRef(false);

  const isGuest = !loading && !user;
  const isAdmin = !loading && user && user.role !== "user";

  useEffect(() => {
    if (isAdmin && !hasHandled.current) {
      hasHandled.current = true;
      toast("This page is only available for users", "info");
      navigate("/");
    }
  }, [isAdmin, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone-400 dark:text-stone-500">Loading...</p>
      </div>
    );
  }

  if (isGuest) {
    return <Navigate to="/login" />;
  }

  if (isAdmin) {
    return null;
  }

  return children;
}
