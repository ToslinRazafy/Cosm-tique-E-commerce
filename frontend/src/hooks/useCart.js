import { useState, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./useAuth";

export const useCart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/client/cart", {
        params: { userId: user.id },
      });
      setCart(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération du panier"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const addToCart = useCallback(
    async (productId, quantity) => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.post("/client/cart/add", {
          userId: user.id,
          productId,
          quantity,
        });
        setCart(response.data);
        return response.data;
      } catch (err) {
        setError(err.response?.data || "Erreur lors de l'ajout au panier");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const updateCartItem = useCallback(
    async (itemId, quantity) => {
      setLoading(true);
      setError(null);
      try {
        await api.put(`/client/cart/update/${itemId}`, { quantity });
        const response = await api.get("/client/cart", {
          params: { userId: user.id },
        });
        setCart(response.data);
      } catch (err) {
        setError(
          err.response?.data || "Erreur lors de la mise à jour du panier"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/client/cart/remove/${itemId}`);
        const response = await api.get("/client/cart", {
          params: { userId: user.id },
        });
        setCart(response.data);
      } catch (err) {
        setError(
          err.response?.data || "Erreur lors de la suppression du panier"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const clearCart = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete("/client/cart/clear", {
        params: { userId: user.id },
      });
      setCart(null);
    } catch (err) {
      setError(err.response?.data || "Erreur lors du vidage du panier");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
};
