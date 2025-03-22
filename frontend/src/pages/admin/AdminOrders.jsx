import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Edit, X, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { useOrders } from "../../hooks/useOrders";
import Loader from "../../components/Loader";

const AdminOrders = () => {
  const { orders, fetchOrders, updateOrderStatus, fetchOrderById, loading } =
    useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editOrder, setEditOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  const statusOptions = [
    "EN_ATTENTE",
    "EN_COURS_DE_TRAITEMENT",
    "EXPEDIE",
    "LIVRE",
    "ANNULE",
  ];

  useEffect(() => {
    fetchOrders(true); // Mode admin
  }, [fetchOrders]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = safeOrders.filter(
    (order) =>
      (order?.id?.toString().includes(search.toLowerCase()) ||
        order?.utilisateur?.email
          ?.toLowerCase()
          .includes(search.toLowerCase())) &&
      (!statusFilter || order?.statut === statusFilter)
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditOrder = useCallback(
    async (e) => {
      e.preventDefault();
      if (!editOrder) return;
      setActionLoading(true);
      try {
        await updateOrderStatus(editOrder.id, editOrder.statut);
        setEditOrder(null);
        setIsEditModalOpen(false);
        toast.success("Statut mis à jour avec succès");
      } catch (err) {
        toast.error("Erreur lors de la mise à jour du statut");
      } finally {
        setActionLoading(false);
      }
    },
    [updateOrderStatus, editOrder]
  );

  const handleViewDetails = useCallback(
    async (order) => {
      setActionLoading(true);
      try {
        const detailedOrder = await fetchOrderById(order.id, true); // Mode admin
        setEditOrder(detailedOrder);
        setIsDetailsModalOpen(true);
      } catch (err) {
        toast.error("Erreur lors de la récupération des détails");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchOrderById]
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
          <ShoppingBag size={28} /> Gestion des Commandes
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-600"
              size={20}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par ID ou email..."
              className="w-full pl-10 pr-4 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 p-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <p className="text-rose-600 text-center p-6">
            Aucune commande trouvée
          </p>
        ) : (
          <>
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-rose-50">
                <tr>
                  <th className="p-4 text-rose-700 font-semibold">ID</th>
                  <th className="p-4 text-rose-700 font-semibold">
                    Utilisateur
                  </th>
                  <th className="p-4 text-rose-700 font-semibold">Statut</th>
                  <th className="p-4 text-rose-700 font-semibold">Total</th>
                  <th className="p-4 text-rose-700 font-semibold">Date</th>
                  <th className="p-4 text-rose-700 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-rose-50 transition-colors"
                  >
                    <td className="p-4 text-rose-600">{order.id}</td>
                    <td className="p-4 text-rose-600">
                      {order.utilisateur?.email || "N/A"}
                    </td>
                    <td className="p-4 text-rose-600">{order.statut}</td>
                    <td className="p-4 text-rose-600">
                      {order.total.toFixed(2)} Ar
                    </td>
                    <td className="p-4 text-rose-600">
                      {new Date(order.dateCommande).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(order)}
                        className="text-rose-600 hover:text-rose-700"
                        disabled={actionLoading}
                      >
                        <Eye size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditOrder(order);
                          setIsEditModalOpen(true);
                        }}
                        className="text-rose-600 hover:text-rose-700"
                        disabled={actionLoading}
                      >
                        <Edit size={20} />
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
        {isDetailsModalOpen && editOrder && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-rose-700">
                  Détails Commande #{editOrder.id}
                </h3>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4 text-rose-600">
                <p>
                  <strong>Email :</strong>{" "}
                  {editOrder.utilisateur?.email || "N/A"}
                </p>
                <p>
                  <strong>Statut :</strong> {editOrder.statut}
                </p>
                <p>
                  <strong>Total :</strong> {editOrder.total.toFixed(2)} Ar
                </p>
                <p>
                  <strong>Date :</strong>{" "}
                  {new Date(editOrder.dateCommande).toLocaleString()}
                </p>
                <h4 className="text-rose-700 font-semibold">Articles :</h4>
                {Array.isArray(editOrder.lignesCommande) &&
                editOrder.lignesCommande.length > 0 ? (
                  <ul className="space-y-2">
                    {editOrder.lignesCommande.map((item) => (
                      <li key={item.id} className="border-b py-2">
                        <span>
                          {item.produit?.nom || "N/A"} (x{item.quantite}) -{" "}
                          {item.produit?.prix.toFixed(2)} Ar
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun article</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && editOrder && (
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
                  Modifier Commande #{editOrder.id}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEditOrder} className="space-y-4">
                <div>
                  <label className="block text-rose-600 font-medium mb-1">
                    Statut
                  </label>
                  <select
                    value={editOrder.statut}
                    onChange={(e) =>
                      setEditOrder({ ...editOrder, statut: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={actionLoading}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
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
    </motion.div>
  );
};

export default AdminOrders;
