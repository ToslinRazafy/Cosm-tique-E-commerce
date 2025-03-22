import { useState, useCallback } from "react";
import api from "../api/api";

export const useStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [historiqueStocks, setHistoriqueStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/stocks");
      setStocks(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération des stocks"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

    const fetchHistoriqueStocks = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/admin/historique-stock");
        setHistoriqueStocks(response.data);
        return response.data;
      } catch (err) {
        setError(
          err.response?.data || "Erreur lors de la récupération des stocks"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);


  const fetchLowStockAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/stocks/low");
      setStocks(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data ||
          "Erreur lors de la récupération des alertes de stock"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStock = useCallback(async (productId, quantity, isAddition) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/admin/stocks/${productId}`, {
        quantity,
        isAddition,
      });
      setStocks((prev) =>
        prev.map((s) => (s.produit.id === productId ? response.data : s))
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Erreur lors de la mise à jour du stock");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stocks,
    loading,
    error,
    fetchStocks,
    fetchLowStockAlerts,
    updateStock,
    fetchHistoriqueStocks,
    historiqueStocks
  };
};
