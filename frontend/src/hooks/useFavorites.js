import { useState, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./useAuth";

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/client/favorites", {
        params: { userId: user.id },
      });
      setFavorites(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération des favoris"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const addToFavorites = useCallback(
    async (productId) => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.post("/client/favorites/add", {
          userId: user.id,
          productId,
        });
        setFavorites((prev) => [...prev, response.data]);
        return response.data;
      } catch (err) {
        setError(err.response?.data || "Erreur lors de l'ajout aux favoris");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const removeFromFavorites = useCallback(
    async (productId) => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/client/favorites/remove/${productId}`, {
          params: { userId: user.id },
        });
        setFavorites((prev) => prev.filter((f) => f.produit.id !== productId));
      } catch (err) {
        setError(
          err.response?.data || "Erreur lors de la suppression des favoris"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
  };
};
