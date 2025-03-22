import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Percent, Plus, Trash2, X, Search } from "lucide-react";
import { toast } from "react-toastify";
import { usePromotions } from "../../hooks/usePromotions";
import { useProducts } from "../../hooks/useProducts"; // Pour récupérer les produits
import Loader from "../../components/Loader";

const AdminPromotions = () => {
  const {
    promotions,
    fetchPromotions,
    addPromotion,
    deletePromotion,
    loading,
  } = usePromotions();
  const { products, fetchProducts } = useProducts(); // Pour la liste des produits
  const [search, setSearch] = useState("");
  const [newPromo, setNewPromo] = useState({
    productId: "",
    reductionPourcentage: "",
    dateDebut: "",
    dateFin: "",
  });
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPromotions(true); // Mode admin
    fetchProducts(true); // Mode admin pour avoir tous les produits
  }, [fetchPromotions, fetchProducts]);

  const validatePromo = useCallback((promo) => {
    const errors = {};
    if (!promo.productId) errors.productId = "Produit requis";
    if (
      !promo.reductionPourcentage ||
      promo.reductionPourcentage <= 0 ||
      promo.reductionPourcentage > 100
    )
      errors.reductionPourcentage = "Réduction entre 1 et 100 % requise";
    if (!promo.dateDebut || new Date(promo.dateDebut) < new Date())
      errors.dateDebut = "Date de début future ou présente requise";
    if (!promo.dateFin || new Date(promo.dateFin) <= new Date(promo.dateDebut))
      errors.dateFin = "Date de fin après la date de début requise";
    return errors;
  }, []);

  const safePromotions = Array.isArray(promotions) ? promotions : [];
  const filteredPromotions = safePromotions.filter((promo) =>
    promo?.produit?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddPromo = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validatePromo(newPromo);
      if (Object.keys(errors).length) {
        Object.values(errors).forEach((error) => toast.error(error));
        return;
      }
      setActionLoading(true);
      try {
        await addPromotion({
          productId: parseInt(newPromo.productId),
          reductionPourcentage: parseFloat(newPromo.reductionPourcentage),
          dateDebut: newPromo.dateDebut,
          dateFin: newPromo.dateFin,
        });
        setNewPromo({
          productId: "",
          reductionPourcentage: "",
          dateDebut: "",
          dateFin: "",
        });
        setIsAddModalOpen(false);
        toast.success("Promotion ajoutée avec succès");
      } catch (err) {
        toast.error(err.message || "Erreur lors de l'ajout de la promotion");
      } finally {
        setActionLoading(false);
      }
    },
    [addPromotion, newPromo, validatePromo]
  );

  const handleDeletePromo = useCallback(async () => {
    if (!selectedPromo) return;
    setActionLoading(true);
    try {
      await deletePromotion(selectedPromo.id);
      setIsDeleteModalOpen(false);
      setSelectedPromo(null);
      toast.success("Promotion supprimée avec succès");
    } catch (err) {
      toast.error(
        err.message || "Erreur lors de la suppression de la promotion"
      );
    } finally {
      setActionLoading(false);
    }
  }, [deletePromotion, selectedPromo]);

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
          <Percent size={28} /> Gestion des Promotions
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
              placeholder="Rechercher par produit..."
              className="w-full pl-10 pr-4 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-rose-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition-colors"
            disabled={actionLoading}
          >
            <Plus size={20} /> Ajouter
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        {filteredPromotions.length === 0 ? (
          <p className="text-rose-600 text-center p-6">
            Aucune promotion trouvée
          </p>
        ) : (
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-rose-50">
              <tr>
                <th className="p-4 text-rose-700 font-semibold">Produit</th>
                <th className="p-4 text-rose-700 font-semibold">
                  Réduction (%)
                </th>
                <th className="p-4 text-rose-700 font-semibold">Début</th>
                <th className="p-4 text-rose-700 font-semibold">Fin</th>
                <th className="p-4 text-rose-700 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPromotions.map((promo) => (
                <tr
                  key={promo?.id}
                  className="border-b hover:bg-rose-50 transition-colors"
                >
                  <td className="p-4 text-rose-600">
                    {promo?.produit?.nom || "N/A"}
                  </td>
                  <td className="p-4 text-rose-600">
                    {promo?.reductionPourcentage || "0"}%
                  </td>
                  <td className="p-4 text-rose-600">
                    {promo?.dateDebut
                      ? new Date(promo.dateDebut).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4 text-rose-600">
                    {promo?.dateFin
                      ? new Date(promo.dateFin).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedPromo(promo);
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
                  Ajouter une Promotion
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                  disabled={actionLoading}
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddPromo} className="space-y-4">
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Produit *
                  </label>
                  <select
                    value={newPromo.productId}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, productId: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={actionLoading}
                  >
                    <option value="">Sélectionner un produit</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Réduction (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPromo.reductionPourcentage}
                    onChange={(e) =>
                      setNewPromo({
                        ...newPromo,
                        reductionPourcentage: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Ex: 10"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Date de début *
                  </label>
                  <input
                    type="datetime-local"
                    value={newPromo.dateDebut}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, dateDebut: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Date de fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={newPromo.dateFin}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, dateFin: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={actionLoading}
                  />
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
        {isDeleteModalOpen && selectedPromo && (
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
                Supprimer la promotion pour "
                {selectedPromo.produit?.nom || "N/A"}" ?
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeletePromo}
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

export default AdminPromotions;
