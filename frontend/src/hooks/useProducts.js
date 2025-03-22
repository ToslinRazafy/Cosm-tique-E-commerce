import { useState, useCallback } from "react";
import api from "../api/api";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (isAdmin = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = isAdmin ? "/admin/products" : "/client/products";
      const response = await api.get(url);
      // Le backend peut renvoyer null ou undefined, on gère cela ici
      setProducts(response.data || []);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération des produits"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/client/products/${id}`);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération du produit"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData, imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append(
        "produit",
        new Blob([JSON.stringify(productData)], { type: "application/json" })
      );
      if (imageFile) formData.append("image", imageFile);

      const response = await api.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Erreur lors de la création du produit");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id, productData, imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append(
        "produit",
        new Blob([JSON.stringify(productData)], { type: "application/json" })
      );
      if (imageFile) formData.append("image", imageFile);
      const response = await api.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? response.data : p)));
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la mise à jour du produit"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la suppression du produit"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
