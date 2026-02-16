import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/axios";

const WishlistContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  return useContext(WishlistContext);
}

async function fetchWishlistIds(user) {
  if (!user || user.role !== "user") return [];
  try {
    const res = await api.get("wishlist/");
    return res.data.map((item) => item.product.id);
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "user") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWishlistIds([]);
      return;
    }

    let cancelled = false;
    fetchWishlistIds(user).then((ids) => {
      if (!cancelled) setWishlistIds(ids);
    });

    return () => { cancelled = true; };
  }, [user]);

  const toggleWishlist = useCallback(async (productId) => {
    try {
      const res = await api.post("wishlist/toggle/", { product_id: productId });
      if (res.data.status === "added") {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
      return res.data.status;
    } catch {
      return null;
    }
  }, []);

  const removeFromWishlist = useCallback(async (wishlistItemId, productId) => {
    try {
      await api.delete(`wishlist/${wishlistItemId}/`);
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      return true;
    } catch {
      return false;
    }
  }, []);

  const isWishlisted = useCallback(
    (productId) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const refreshWishlist = useCallback(async () => {
    const ids = await fetchWishlistIds(user);
    setWishlistIds(ids);
  }, [user]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
