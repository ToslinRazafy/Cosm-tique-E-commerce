import { useState, useCallback } from "react";
import api from "../api/api";

export const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromotions = useCallback(async (isAdmin = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = isAdmin ? "/admin/promotions" : "/client/promotions";
      const response = await api.get(url);
      setPromotions(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération des promotions"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addPromotion = useCallback(async (promotionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/admin/promotions", promotionData);
      setPromotions((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la création de la promotion"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePromotion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/admin/promotions/${id}`);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la suppression de la promotion"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    addPromotion,
    deletePromotion,
  };
};
