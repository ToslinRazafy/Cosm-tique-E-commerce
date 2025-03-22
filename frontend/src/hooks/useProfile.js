import { useState, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./useAuth";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/client/profile", {
        params: { userId: user.id },
      });
      setProfile(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || "Erreur lors de la récupération du profil"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateProfile = useCallback(
    async (profileData) => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.put("/client/profile", {
          userId: user.id,
          ...profileData,
        });
        setProfile(response.data);
        return response.data;
      } catch (err) {
        setError(
          err.response?.data || "Erreur lors de la mise à jour du profil"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  return { profile, loading, error, fetchProfile, updateProfile };
};
