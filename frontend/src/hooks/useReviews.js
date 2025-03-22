import { useState, useCallback } from "react";
import api from "../api/api";

export const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(
    async (isAdmin = false, productId = null) => {
      setLoading(true);
      setError(null);
      try {
        const url = isAdmin ? "/admin/reviews" : `/client/reviews/${productId}`;
        const response = await api.get(url);
        setReviews(response.data);
        return response.data;
      } catch (err) {
        setError(
          err.response?.data || "Erreur lors de la récupération des avis"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addReview = useCallback(async (productId, note, commentaire, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/client/reviews", {
        productId,
        note,
        commentaire,
        userId,
      });
      setReviews((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Erreur lors de l'ajout de l'avis");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.response?.data || "Erreur lors de la suppression de l'avis");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reviews, loading, error, fetchReviews, addReview, deleteReview };
};
