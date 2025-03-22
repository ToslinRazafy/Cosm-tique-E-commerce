import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Eye, X } from "lucide-react";
import { useOrders } from "../../hooks/useOrders";
import { toast } from "react-toastify";

const OrderHistoryPage = () => {
  const { orders, fetchOrders, loading, error } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState(null); // État pour suivre la commande sélectionnée

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const openModal = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const closeModal = () => {
    setSelectedOrderId(null);
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto h-screen flex flex-col"
    >
      <h1 className="text-3xl font-semibold text-rose-700 mb-8 flex items-center gap-2 flex-shrink-0">
        <Package size={32} /> Historique des Commandes
      </h1>

      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <p className="text-rose-600 text-center">Chargement...</p>
        ) : orders.length === 0 ? (
          <p className="text-rose-600 text-center">
            Aucune commande pour le moment.
          </p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-rose-700 font-semibold">
                      Commande #{order.id}
                    </p>
                    <p className="text-rose-600">
                      Date: {new Date(order.dateCommande).toLocaleDateString()}
                    </p>
                    <p className="text-rose-600">
                      Total: {(order.total || 0).toFixed(2)} Ar
                    </p>
                    <p
                      className={`text-${
                        order.statut === "DELIVERED"
                          ? "green"
                          : order.statut === "CANCELLED"
                          ? "red"
                          : "yellow"
                      }-600`}
                    >
                      Statut: {order.statut || "N/A"}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => openModal(order.id)}
                    className="bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye size={20} /> Aperçu
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-rose-700">
                Détails de la commande #{selectedOrder.id}
              </h3>
              <button
                onClick={closeModal}
                className="text-rose-600 hover:text-rose-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {selectedOrder.lignesCommande &&
              selectedOrder.lignesCommande.length > 0 ? (
                <table className="w-full text-rose-600">
                  <thead>
                    <tr className="border-b border-rose-200">
                      <th className="text-left py-2">Produit</th>
                      <th className="text-center py-2">Quantité</th>
                      <th className="text-right py-2">Prix Unitaire</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.lignesCommande.map((ligne, index) => (
                      <tr key={index} className="border-b border-rose-100">
                        <td className="py-2">{ligne.produit.nom}</td>
                        <td className="text-center py-2">{ligne.quantite}</td>
                        <td className="text-right py-2">
                          {(
                            ligne.produit.prix?.doubleValue ||
                            ligne.produit.prix
                          ).toFixed(2)}{" "}
                          Ar
                        </td>
                        <td className="text-right py-2">
                          {(
                            (ligne.produit.prix?.doubleValue ||
                              ligne.produit.prix) * ligne.quantite
                          ).toFixed(2)}{" "}
                          Ar
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-rose-600">
                  Aucun article dans cette commande.
                </p>
              )}
              <p className="text-rose-700 font-semibold text-right">
                Total: {(selectedOrder.total || 0).toFixed(2)} Ar
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default OrderHistoryPage;
