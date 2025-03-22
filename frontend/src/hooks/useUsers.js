import { useState, useCallback } from "react";
import api from "../api/api";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération des utilisateurs"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      setUsers((prev) => prev.map((u) => (u.id === id ? response.data : u)));
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la mise à jour de l'utilisateur"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const blockUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/admin/users/${id}/block`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, blocked: true } : u))
      );
    } catch (err) {
      setError(err.response?.data || "Erreur lors du blocage de l'utilisateur");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unblockUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/admin/users/${id}/unblock`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, blocked: false } : u))
      );
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors du déblocage de l'utilisateur"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la suppression de l'utilisateur"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUser,
    blockUser,
    unblockUser,
    deleteUser,
  };
};
