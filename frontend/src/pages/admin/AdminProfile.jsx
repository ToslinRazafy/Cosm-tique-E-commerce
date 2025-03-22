import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X, Edit } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth"; // Pour récupérer l'utilisateur connecté
import { useUsers } from "../../hooks/useUsers"; // Pour updateUser
import Loader from "../../components/Loader";

const AdminProfile = () => {
  const { user: authUser, loading: authLoading } = useAuth(); // Utilisateur connecté
  const { updateUser, loading: usersLoading } = useUsers(); // Pour mettre à jour l'utilisateur
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      setFormData({
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        email: authUser.email || "",
        role: authUser.role || "ADMIN",
      });
    }
  }, [authUser]);

  const validateForm = useCallback((data) => {
    const errors = {};
    if (!data.firstName || data.firstName.trim().length < 2)
      errors.firstName = "Prénom requis (min 2 caractères)";
    if (!data.lastName || data.lastName.trim().length < 2)
      errors.lastName = "Nom requis (min 2 caractères)";
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Email invalide";
    if (!data.role || !["CLIENT", "ADMIN"].includes(data.role.toUpperCase()))
      errors.role = "Rôle invalide (Client ou Administrateur)";
    return errors;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateForm(formData);
      if (Object.keys(errors).length) {
        Object.values(errors).forEach((error) => toast.error(error));
        return;
      }
      if (!authUser?.id) {
        toast.error("Utilisateur non identifié");
        return;
      }
      setActionLoading(true);
      try {
        await updateUser(authUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role.toUpperCase(),
          blocked: authUser.blocked, // Conserver l'état de blocage
        });
        // Mise à jour manuelle de localStorage pour refléter les changements
        const updatedUser = {
          ...authUser,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role.toUpperCase(),
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsModalOpen(false);
        toast.success("Profil mis à jour avec succès");
      } catch (err) {
        toast.error(err.message || "Erreur lors de la mise à jour du profil");
      } finally {
        setActionLoading(false);
      }
    },
    [formData, updateUser, authUser]
  );

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  if (authLoading || usersLoading || !authUser) return <Loader />;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 bg-gray-50 min-h-screen"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-rose-700 flex items-center gap-2">
          <User size={28} /> Profil Administrateur
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition-colors"
          disabled={actionLoading}
        >
          <Edit size={20} /> Modifier
        </motion.button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 text-2xl font-bold">
            {formData.firstName?.charAt(0) || "A"}
            {formData.lastName?.charAt(0) || "D"}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-rose-700">
              {formData.firstName || "N/A"} {formData.lastName || "N/A"}
            </h2>
            <p className="text-rose-600">{formData.email || "N/A"}</p>
            <p className="text-rose-600">Rôle : {formData.role || "N/A"}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-rose-700">
                  Modifier le Profil
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                  disabled={actionLoading}
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={actionLoading}
                    placeholder="Entrez votre prénom"
                  />
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={actionLoading}
                    placeholder="Entrez votre nom"
                  />
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={actionLoading}
                    placeholder="Entrez votre email"
                  />
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Rôle *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={actionLoading}
                  >
                    <option value="CLIENT">Client</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Mise à jour..." : "Mettre à jour"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminProfile;
