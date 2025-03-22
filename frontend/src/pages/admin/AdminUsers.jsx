import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Edit, Trash2, Lock, Unlock, X } from "lucide-react";
import { toast } from "react-toastify";
import { useUsers } from "../../hooks/useUsers";
import { useAuth } from "../../hooks/useAuth"; // Ajout pour récupérer l'utilisateur connecté
import Loader from "../../components/Loader";

const AdminUsers = () => {
  const {
    users,
    fetchUsers,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
    loading,
  } = useUsers();
  const { user: currentUser } = useAuth(); // Récupérer l'utilisateur connecté
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(
    (user) =>
      user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const validateUser = useCallback((user) => {
    const errors = {};
    if (!user.firstName || user.firstName.trim().length < 2)
      errors.firstName = "Prénom requis (min 2 caractères)";
    if (!user.lastName || user.lastName.trim().length < 2)
      errors.lastName = "Nom requis (min 2 caractères)";
    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      errors.email = "Email invalide";
    return errors;
  }, []);

  const handleEditUser = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selectedUser) return;
      const errors = validateUser(selectedUser);
      if (Object.keys(errors).length) {
        Object.values(errors).forEach((error) => toast.error(error));
        return;
      }
      setActionLoading(true);
      try {
        await updateUser(selectedUser.id, {
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          email: selectedUser.email,
          role: selectedUser.role.toUpperCase(),
          blocked: selectedUser.blocked,
        });
        setIsEditModalOpen(false);
        setSelectedUser(null);
        toast.success("Utilisateur mis à jour avec succès");
      } catch (err) {
        toast.error(
          err.message || "Erreur lors de la mise à jour de l'utilisateur"
        );
      } finally {
        setActionLoading(false);
      }
    },
    [updateUser, selectedUser]
  );

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      toast.success("Utilisateur supprimé avec succès");
    } catch (err) {
      toast.error(
        err.message || "Erreur lors de la suppression de l'utilisateur"
      );
    } finally {
      setActionLoading(false);
    }
  }, [deleteUser, selectedUser]);

  const handleBlockUser = useCallback(
    async (userId) => {
      setActionLoading(true);
      try {
        await blockUser(userId);
        toast.success("Utilisateur bloqué avec succès");
      } catch (err) {
        toast.error(err.message || "Erreur lors du blocage de l'utilisateur");
      } finally {
        setActionLoading(false);
      }
    },
    [blockUser]
  );

  const handleUnblockUser = useCallback(
    async (userId) => {
      setActionLoading(true);
      try {
        await unblockUser(userId);
        toast.success("Utilisateur débloqué avec succès");
      } catch (err) {
        toast.error(err.message || "Erreur lors du déblocage de l'utilisateur");
      } finally {
        setActionLoading(false);
      }
    },
    [unblockUser]
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

  if (loading) return <Loader />;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 bg-gray-50 min-h-screen"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-rose-700 flex items-center gap-2">
          <Users size={28} /> Gestion des Utilisateurs
        </h1>
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-600"
            size={20}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-rose-600 text-center p-6">
            Aucun utilisateur trouvé
          </p>
        ) : (
          <>
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-rose-50">
                <tr>
                  <th className="p-4 text-rose-700 font-semibold">Prénom</th>
                  <th className="p-4 text-rose-700 font-semibold">Nom</th>
                  <th className="p-4 text-rose-700 font-semibold">Email</th>
                  <th className="p-4 text-rose-700 font-semibold">Rôle</th>
                  <th className="p-4 text-rose-700 font-semibold">Statut</th>
                  <th className="p-4 text-rose-700 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr
                    key={user?.id}
                    className={`border-b hover:bg-rose-50 transition-colors ${
                      user?.id === currentUser?.id ? "bg-rose-100" : ""
                    }`}
                  >
                    <td className="p-4 text-rose-600">
                      {user?.firstName || "N/A"}
                    </td>
                    <td className="p-4 text-rose-600">
                      {user?.lastName || "N/A"}
                    </td>
                    <td className="p-4 text-rose-600">
                      {user?.email || "N/A"}
                    </td>
                    <td className="p-4 text-rose-600">{user?.role || "N/A"}</td>
                    <td className="p-4 text-rose-600">
                      {user?.blocked ? "Bloqué" : "Actif"}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {user?.id !== currentUser?.id && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                          className="text-rose-600 hover:text-rose-700"
                          disabled={actionLoading}
                        >
                          <Edit size={20} />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          user.blocked
                            ? handleUnblockUser(user.id)
                            : handleBlockUser(user.id)
                        }
                        className={
                          user.blocked
                            ? "text-green-600 hover:text-green-700"
                            : "text-orange-600 hover:text-orange-700"
                        }
                        disabled={actionLoading}
                      >
                        {user.blocked ? (
                          <Unlock size={20} />
                        ) : (
                          <Lock size={20} />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                        disabled={actionLoading}
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="p-4 flex justify-center items-center gap-4">
                <motion.button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 border border-rose-300 rounded-lg text-rose-600 disabled:opacity-50"
                >
                  Précédent
                </motion.button>
                <span className="text-rose-600 font-medium">
                  Page {currentPage} / {totalPages}
                </span>
                <motion.button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 border border-rose-300 rounded-lg text-rose-600 disabled:opacity-50"
                >
                  Suivant
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
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
                  Modifier l'Utilisateur
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                  disabled={actionLoading}
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="hidden">
                  <label className="block text-rose-600 font-medium mb-1">
                    Prénom *
                  </label>
                  <input
                    type="hidden"
                    value={selectedUser.firstName || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Entrez le prénom"
                    disabled={actionLoading}
                  />
                </div>
                <div className="hidden">
                  <label className="block text-rose-600 font-medium mb-1">
                    Nom *
                  </label>
                  <input
                    type="hidden"
                    value={selectedUser.lastName || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Entrez le nom"
                    disabled={actionLoading}
                  />
                </div>
                <div className="hidden">
                  <label className="block text-rose-600 font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="hidden"
                    value={selectedUser.email || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Entrez l'email"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Rôle *
                  </label>
                  <select
                    value={selectedUser.role || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, role: e.target.value })
                    }
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
                  {actionLoading ? "Mise à jour..." : "Sauvegarder"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && selectedUser && (
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
                  Confirmer la Suppression
                </h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                  disabled={actionLoading}
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-rose-600 mb-6">
                Supprimer l'utilisateur "{selectedUser.firstName || "N/A"}{" "}
                {selectedUser.lastName || "N/A"}" ?
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteUser}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Suppression..." : "Oui"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-rose-100 text-rose-600 py-2 rounded-lg hover:bg-rose-200 transition-colors"
                  disabled={actionLoading}
                >
                  Non
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUsers;
