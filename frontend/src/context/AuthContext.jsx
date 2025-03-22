// context/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user } = response.data;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la connexion");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", userData);
      return response.data.email;
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email, code, userData) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        code,
        user: userData,
      });
      const user = response.data;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err) {
      setError(err.response?.data?.error || "Code OTP invalide");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestResetPassword = async (email) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password/request", {
        email,
      });
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Erreur lors de la demande de réinitialisation"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmResetPassword = async (email, code, newPassword) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password/confirm", {
        email,
        code,
        newPassword,
      });
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.error || "Erreur lors de la réinitialisation"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (email) => {
    setLoading(true);
    try {
      await api.post("/auth/logout", { email });
      setUser(null);
      localStorage.removeItem("user");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la déconnexion");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    if (!user?.id) throw new Error("Utilisateur non connecté");
    setLoading(true);
    try {
      const response = await api.put(`/api/admin/users/${user.id}`, userData);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      setError(
        err.response?.data?.error || "Erreur lors de la mise à jour du profil"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    register,
    verifyOtp,
    requestResetPassword,
    confirmResetPassword,
    logout,
    loading,
    error,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
