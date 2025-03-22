import { useState, useCallback } from "react";
import api from "../api/api";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (isAdmin = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = isAdmin ? "/admin/categories" : "/client/categories";
      const response = await api.get(url);
      setCategories(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération des catégories"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/admin/categories", categoryData);
      setCategories((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la création de la catégorie"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/admin/categories/${id}`, categoryData);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? response.data : c))
      );
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la mise à jour de la catégorie"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la suppression de la catégorie"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
