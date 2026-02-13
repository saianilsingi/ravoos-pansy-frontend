import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/axios";

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}

async function fetchCartCount(user) {
  if (!user || user.role !== "user") return 0;
  try {
    const res = await api.get("cart/");
    return res.data.length;
  } catch {
    return 0;
  }
}

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart count when user logs in / changes
  useEffect(() => {
    if (!user || user.role !== "user") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartCount(0);
      return;
    }

    let cancelled = false;
    fetchCartCount(user).then((count) => {
      if (!cancelled) setCartCount(count);
    });

    return () => { cancelled = true; };
  }, [user]);

  const refreshCart = useCallback(async () => {
    const count = await fetchCartCount(user);
    setCartCount(count);
  }, [user]);

  const addToCart = useCallback(async (productId) => {
    try {
      await api.post("cart/add/", { product_id: productId, quantity: 1 });
      const count = await fetchCartCount(user);
      setCartCount(count);
      return true;
    } catch {
      return false;
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, addToCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}
