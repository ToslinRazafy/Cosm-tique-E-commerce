import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Bell, Plus, Minus, X } from "lucide-react";
import { toast } from "react-toastify";
import { useStocks } from "../../hooks/useStocks";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import Loader from "../../components/Loader";
import { IMG_URL_BACKEND } from "../../constant";

const AdminStock = () => {
  const {
    stocks,
    fetchStocks,
    fetchHistoriqueStocks,
    historiqueStocks,
    updateStock,
    loading,
  } = useStocks();
  const { updateProduct } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const [search, setSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [threshold, setThreshold] = useState("");
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState("Entrée");
  const [actionLoading, setActionLoading] = useState(false);

  const quantityRegex = /^[1-9][0-9]*$/;
  const thresholdRegex = /^[0-9]+$/;

  useEffect(() => {
    fetchStocks();
    fetchCategories(true);
    fetchHistoriqueStocks();
  }, [fetchStocks, fetchCategories, fetchHistoriqueStocks]);

  const safeStocks = Array.isArray(stocks) ? stocks : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const filteredStocks = safeStocks.filter((stock) =>
    stock?.produit?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const validateQuantity = (value) =>
    !value
      ? "Quantité requise"
      : !quantityRegex.test(value)
      ? "Nombre positif non nul requis"
      : "";

  const validateThreshold = (value) =>
    !value && value !== "0"
      ? "Seuil requis"
      : !thresholdRegex.test(value)
      ? "Nombre positif requis"
      : "";

  const getCategoryIdForProduct = (productId) => {
    const category = safeCategories.find((cat) =>
      cat.produits.some((p) => p.id === productId)
    );
    return category ? category.id : null;
  };

  const handleSetThreshold = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selectedStock) return;
      const error = validateThreshold(threshold);
      if (error) {
        toast.error(error);
        return;
      }
      setActionLoading(true);
      try {
        await updateStock(
          selectedStock.produit.id,
          0,
          true,
          parseInt(threshold)
        );
        toast.success(`Seuil mis à jour pour ${selectedStock.produit.nom}`);
        if ((selectedStock.quantite || 0) <= parseInt(threshold)) {
          toast.warn(`Stock bas pour ${selectedStock.produit.nom} !`);
        }
        // Rafraîchir les données après la mise à jour
        await fetchStocks();
        await fetchHistoriqueStocks();
        setIsThresholdModalOpen(false);
        setThreshold("");
        setSelectedStock(null);
      } catch (err) {
        toast.error(err.message || "Erreur lors de la mise à jour du seuil");
      } finally {
        setActionLoading(false);
      }
    },
    [updateStock, selectedStock, threshold, fetchStocks, fetchHistoriqueStocks] // Ajout des dépendances
  );

  const handleStockUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selectedStock) return;
      const error = validateQuantity(quantity);
      if (error) {
        toast.error(error);
        return;
      }
      const qty = parseInt(quantity);
      const currentStock = selectedStock.quantite || 0;
      const isAddition = actionType === "Entrée";
      const newStock = isAddition ? currentStock + qty : currentStock - qty;

      if (newStock < 0) {
        toast.error("Stock insuffisant pour cette sortie");
        return;
      }

      setActionLoading(true);
      try {
        await updateStock(selectedStock.produit.id, qty, isAddition);
        toast.success(`Stock mis à jour pour ${selectedStock.produit.nom}`);
        if (newStock <= (selectedStock.seuilBas || 5)) {
          toast.warn(`Stock bas pour ${selectedStock.produit.nom} !`);
        }
        // Rafraîchir les données après la mise à jour
        await fetchStocks();
        await fetchHistoriqueStocks();
        setIsStockModalOpen(false);
        setQuantity("");
        setSelectedStock(null);
      } catch (err) {
        toast.error(err.message || "Erreur lors de la mise à jour du stock");
      } finally {
        setActionLoading(false);
      }
    },
    [
      updateStock,
      selectedStock,
      quantity,
      actionType,
      fetchStocks,
      fetchHistoriqueStocks,
    ] // Ajout des dépendances
  );

  const handleEditProduct = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selectedProduct) return;
      const errors = {};
      if (
        !selectedProduct.seuilStockBas ||
        isNaN(selectedProduct.seuilStockBas) ||
        selectedProduct.seuilStockBas < 0
      )
        errors.seuilStockBas = "Seuil stock bas invalide";
      if (Object.keys(errors).length) {
        Object.values(errors).forEach((error) => toast.error(error));
        return;
      }
      setActionLoading(true);
      try {
        const categoryId = getCategoryIdForProduct(selectedProduct.id);
        await updateProduct(
          selectedProduct.id,
          {
            nom: selectedProduct.nom,
            description: selectedProduct.description || null,
            prix: parseFloat(selectedProduct.prix),
            prixOriginal: 0,
            stock: parseInt(selectedProduct.stock, 10),
            seuilStockBas: parseInt(selectedProduct.seuilStockBas, 10),
            categorie: categoryId ? { id: categoryId } : null,
            marque: selectedProduct.marque || null,
            ingredients: selectedProduct.ingredients || null,
            dateExpiration: selectedProduct.dateExpiration || null,
          },
          selectedProduct.image instanceof File ? selectedProduct.image : null
        );
        toast.success(`Seuil mis à jour pour ${selectedProduct.nom}`);
        if (
          parseInt(selectedProduct.stock) <=
          parseInt(selectedProduct.seuilStockBas)
        ) {
          toast.warn(`Stock bas pour ${selectedProduct.nom} !`);
        }
        // Rafraîchir les données après la mise à jour
        await fetchStocks();
        await fetchHistoriqueStocks();
        setIsEditModalOpen(false);
        setSelectedProduct(null);
      } catch (err) {
        toast.error("Erreur lors de la mise à jour du seuil");
      } finally {
        setActionLoading(false);
      }
    },
    [
      updateProduct,
      selectedProduct,
      safeCategories,
      fetchStocks,
      fetchHistoriqueStocks,
    ] // Ajout des dépendances
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
      className="p-6 space-y-6 bg-gray-50 min-h-screen overflow-y-auto" // Scroll vertical global
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-rose-700 flex items-center gap-2">
          <Package size={28} /> Gestion des Stocks
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
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto max-h-[500px] overflow-y-auto">
        {filteredStocks.length === 0 ? (
          <p className="text-rose-600 text-center p-6">Aucun stock trouvé</p>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-rose-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-rose-700 font-semibold">Produit</th>
                <th className="p-4 text-rose-700 font-semibold">
                  Stock Actuel
                </th>
                <th className="p-4 text-rose-700 font-semibold">
                  Seuil Alerte
                </th>
                <th className="p-4 text-rose-700 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr
                  key={stock?.id}
                  className={`border-b hover:bg-rose-50 transition-colors ${
                    stock?.quantite <= (stock?.seuilBas || 5)
                      ? "bg-yellow-100"
                      : ""
                  }`}
                >
                  <td className="p-4 text-rose-600">
                    {stock?.produit?.nom || "N/A"}
                  </td>
                  <td className="p-4 text-rose-600">
                    <span
                      className={
                        stock?.quantite <= (stock?.seuilBas || 5)
                          ? "text-red-600 font-semibold"
                          : ""
                      }
                    >
                      {stock?.quantite || 0}
                    </span>
                  </td>
                  <td className="p-4 text-rose-600">{stock?.seuilBas || 5}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedStock(stock);
                        setSelectedProduct({
                          ...stock.produit,
                          stock: stock.quantite.toString(),
                          seuilStockBas: stock.seuilBas.toString(),
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="text-rose-600 hover:text-rose-700"
                      disabled={actionLoading}
                    >
                      <Bell size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedStock(stock);
                        setActionType("Entrée");
                        setIsStockModalOpen(true);
                      }}
                      className="text-green-600 hover:text-green-700"
                      disabled={actionLoading}
                    >
                      <Plus size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedStock(stock);
                        setActionType("Sortie");
                        setIsStockModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                      disabled={actionLoading}
                    >
                      <Minus size={20} />
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto overflow-y-auto">
        <h2 className="text-xl font-semibold text-rose-700 mb-4  bg-white z-10">
          Historique des Mouvements
        </h2>
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left min-w-[600px]">
            <thead className="sticky top-0 bg-rose-50 z-10">
              <tr>
                <th className="p-4 text-rose-700 font-semibold">Produit</th>
                <th className="p-4 text-rose-700 font-semibold">Action</th>
                <th className="p-4 text-rose-700 font-semibold">Quantité</th>
                <th className="p-4 text-rose-700 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {historiqueStocks.length > 0 ? (
                historiqueStocks
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b hover:bg-rose-50 transition-colors"
                    >
                      <td className="p-4 text-rose-600">
                        {entry?.produit.nom || "N/A"}
                      </td>
                      <td className="p-4 text-rose-600">
                        {entry?.action || "N/A"}
                      </td>
                      <td className="p-4 text-rose-600">
                        {entry?.quantity || 0}
                      </td>
                      <td className="p-4 text-rose-600">
                        {entry?.date
                          ? new Date(entry.date)
                              .toLocaleString("fr-FR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: undefined,
                                hour12: false,
                              })
                              .replace(",", "")
                          : "N/A"}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-rose-600">
                    Aucun historique
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isThresholdModalOpen && selectedStock && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-rose-700">
                  Définir le Seuil pour {selectedStock.produit.nom || "N/A"}
                </h3>
                <button
                  onClick={() => setIsThresholdModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                  disabled={actionLoading}
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSetThreshold} className="space-y-4">
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Seuil Alerte *
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    min="0"
                    placeholder="Ex: 5"
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
                  {actionLoading ? "Mise à jour..." : "Sauvegarder"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStockModalOpen && selectedStock && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-rose-700">
                  {actionType} de Stock - {selectedStock.produit.nom || "N/A"}
                </h3>
                <button
                  onClick={() => setIsStockModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                  disabled={actionLoading}
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    min="1"
                    placeholder="Ex: 10"
                    disabled={actionLoading}
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-2 rounded-lg text-white transition-colors ${
                    actionType === "Entrée"
                      ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                      : "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                  }`}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Mise à jour..."
                    : actionType === "Entrée"
                    ? "Ajouter"
                    : "Retirer"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && selectedProduct && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-semibold text-rose-700">
                  Changer le Seuil Stock Bas * - {selectedProduct.nom}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEditProduct} className="space-y-4">
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Seuil Stock Bas *
                  </label>
                  <input
                    type="number"
                    value={selectedProduct.seuilStockBas}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        seuilStockBas: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
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
                  {actionLoading ? "Mise à jour..." : "Enregistrer"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminStock;
