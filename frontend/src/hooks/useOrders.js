import { useState, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./useAuth";

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(
    async (isAdmin = false) => {
      if (!user?.id && !isAdmin) return;
      setLoading(true);
      setError(null);
      try {
        const url = isAdmin ? "/admin/orders" : "/client/orders";
        const response = await api.get(url, {
          params: !isAdmin ? { userId: user.id } : {},
        });
        setOrders(response.data);
        return response.data;
      } catch (err) {
        setError(
          err.response?.data || "Erreur lors de la récupération des commandes"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const fetchOrderById = useCallback(async (id, isAdmin = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = isAdmin ? `/admin/orders/${id}` : `/client/orders/${id}`;
      const response = await api.get(url);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération de la commande"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/client/orders", null, {
        params: { userId: user.id },
      });
      setOrders((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la création de la commande"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const cancelOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/client/orders/${id}/cancel`);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, statut: "CANCELLED" } : o))
      );
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de l'annulation de la commande"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, statut: status } : o))
      );
    } catch (err) {
      setError(err.response?.data || "Erreur lors de la mise à jour du statut");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
    cancelOrder,
    updateOrderStatus,
  };
};
