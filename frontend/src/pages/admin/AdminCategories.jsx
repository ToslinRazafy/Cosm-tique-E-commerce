import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Plus, Edit, Trash2, X, Search } from "lucide-react";
import { toast } from "react-toastify";
import { useCategories } from "../../hooks/useCategories";
import Loader from "../../components/Loader";

const AdminCategories = () => {
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loading,
  } = useCategories();
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState({ nom: "", description: "" });
  const [editCategory, setEditCategory] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories(true); // Mode admin
  }, [fetchCategories]);

  const validateField = useCallback((field, value) => {
    if (field === "nom" && (!value || value.trim().length < 2)) {
      return "Le nom est requis (min 2 caractères)";
    }
    if (field === "description" && value && value.trim().length < 3) {
      return "La description doit avoir au moins 3 caractères si fournie";
    }
    return "";
  }, []);

  const handleAddCategory = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = {
        nom: validateField("nom", newCategory.nom),
        description: validateField("description", newCategory.description),
      };
      if (errors.nom || errors.description) {
        setErrors(errors);
        return;
      }
      setActionLoading(true);
      try {
        await createCategory({
          nom: newCategory.nom,
          description: newCategory.description || null,
        });
        setNewCategory({ nom: "", description: "" });
        setIsAddModalOpen(false);
        toast.success("Catégorie ajoutée avec succès");
      } catch (err) {
        toast.error("Erreur lors de l'ajout de la catégorie");
      } finally {
        setActionLoading(false);
      }
    },
    [createCategory, newCategory, validateField]
  );

  const handleEditCategory = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = {
        nom: validateField("nom", editCategory.nom),
        description: validateField("description", editCategory.description),
      };
      if (errors.nom || errors.description) {
        setErrors(errors);
        return;
      }
      setActionLoading(true);
      try {
        await updateCategory(editCategory.id, {
          nom: editCategory.nom,
          description: editCategory.description || null,
        });
        setEditCategory(null);
        setIsEditModalOpen(false);
        toast.success("Catégorie mise à jour avec succès");
      } catch (err) {
        toast.error("Erreur lors de la mise à jour de la catégorie");
      } finally {
        setActionLoading(false);
      }
    },
    [updateCategory, editCategory, validateField]
  );

  const handleDeleteCategory = useCallback(async () => {
    if (!editCategory) return;
    setActionLoading(true);
    try {
      await deleteCategory(editCategory.id);
      setEditCategory(null);
      setIsDeleteModalOpen(false);
      toast.success("Catégorie supprimée avec succès");
    } catch (err) {
      toast.error("Erreur lors de la suppression de la catégorie");
    } finally {
      setActionLoading(false);
    }
  }, [deleteCategory, editCategory]);

  const safeCategories = Array.isArray(categories) ? categories : [];
  const filteredCategories = safeCategories.filter(
    (cat) =>
      cat?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      cat?.description?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
          <Layers size={28} /> Gestion des Catégories
        </h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-600"
              size={20}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une catégorie..."
              className="w-full pl-10 pr-4 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-rose-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition-colors"
          >
            <Plus size={20} /> Nouvelle Catégorie
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {safeCategories.length === 0 ? (
          <p className="text-rose-600 text-center p-6">
            Aucune catégorie disponible
          </p>
        ) : filteredCategories.length === 0 ? (
          <p className="text-rose-600 text-center p-6">
            Aucune catégorie trouvée
          </p>
        ) : (
          <>
            <table className="w-full text-left">
              <thead className="bg-rose-50">
                <tr>
                  <th className="p-4 text-rose-700 font-semibold">Nom</th>
                  <th className="p-4 text-rose-700 font-semibold">
                    Description
                  </th>
                  <th className="p-4 text-rose-700 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((cat) => (
                  <tr
                    key={cat?.id}
                    className="border-b hover:bg-rose-50 transition-colors"
                  >
                    <td className="p-4 text-rose-600">{cat?.nom || "N/A"}</td>
                    <td className="p-4 text-rose-600">
                      {cat?.description || "Aucune description"}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditCategory(cat);
                          setIsEditModalOpen(true);
                        }}
                        className="text-rose-600 hover:text-rose-700"
                        disabled={actionLoading}
                      >
                        <Edit size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditCategory(cat);
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
        {isAddModalOpen && (
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
                  Nouvelle Catégorie
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newCategory.nom}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, nom: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Nom de la catégorie"
                    required
                    disabled={actionLoading}
                  />
                  {errors.nom && (
                    <p className="text-red-600 text-sm mt-1">{errors.nom}</p>
                  )}
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Description de la catégorie"
                    rows="3"
                    disabled={actionLoading}
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Ajout en cours..." : "Ajouter"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && editCategory && (
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
                  Modifier la Catégorie
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEditCategory} className="space-y-4">
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={editCategory.nom || ""}
                    onChange={(e) =>
                      setEditCategory({ ...editCategory, nom: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Nouveau nom"
                    required
                    disabled={actionLoading}
                  />
                  {errors.nom && (
                    <p className="text-red-600 text-sm mt-1">{errors.nom}</p>
                  )}
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={editCategory.description || ""}
                    onChange={(e) =>
                      setEditCategory({
                        ...editCategory,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Nouvelle description"
                    rows="3"
                    disabled={actionLoading}
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
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
        {isDeleteModalOpen && editCategory && (
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
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-rose-600 mb-6">
                Supprimer la catégorie "{editCategory.nom}" ?
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteCategory}
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

export default AdminCategories;
