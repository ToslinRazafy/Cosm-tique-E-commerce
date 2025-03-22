import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, X, Search } from "lucide-react";
import { toast } from "react-toastify";
import { useReviews } from "../../hooks/useReviews";
import { useProducts } from "../../hooks/useProducts";
import Loader from "../../components/Loader";

const AdminReviews = () => {
  const { reviews, fetchReviews, deleteReview, loading } = useReviews();
  const { products, fetchProducts } = useProducts();
  const [search, setSearch] = useState("");
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews(true); 
    fetchProducts(true);// Mode admin pour récupérer tous les avis
  }, [fetchReviews, fetchProducts]);

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const filteredReviews = safeReviews.filter(
    (review) =>
      review?.produit?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      review?.utilisateur?.firstName
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      review?.utilisateur?.lastName
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleDeleteReview = useCallback(async () => {
    if (!deleteReviewId) return;
    setActionLoading(true);
    try {
      await deleteReview(deleteReviewId);
      setDeleteReviewId(null);
      setIsDeleteModalOpen(false);
      toast.success("Avis supprimé avec succès");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression de l'avis");
    } finally {
      setActionLoading(false);
    }
  }, [deleteReview, deleteReviewId]);

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
          <Star size={28} /> Gestion des Avis
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
            placeholder="Rechercher par produit ou utilisateur..."
            className="w-full pl-10 pr-4 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        {filteredReviews.length === 0 ? (
          <p className="text-rose-600 text-center p-6">Aucun avis trouvé</p>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-rose-50">
              <tr>
                <th className="p-4 text-rose-700 font-semibold">Produit</th>
                <th className="p-4 text-rose-700 font-semibold">Utilisateur</th>
                <th className="p-4 text-rose-700 font-semibold">Note</th>
                <th className="p-4 text-rose-700 font-semibold">Commentaire</th>
                <th className="p-4 text-rose-700 font-semibold">Date</th>
                <th className="p-4 text-rose-700 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr
                  key={review?.id}
                  className="border-b hover:bg-rose-50 transition-colors"
                >
                  <td className="p-4 text-rose-600">
                    {products.find((prod) => prod.avis.some((avi) => avi.id === review.id))?.nom ?? ""}
                  </td>
                  <td className="p-4 text-rose-600">
                    {review?.utilisateur?.firstName || "N/A"}{" "}
                    {review?.utilisateur?.lastName || ""}
                  </td>
                  <td className="p-4 text-rose-600">{review?.note || 0}/5</td>
                  <td className="p-4 text-rose-600 truncate max-w-xs">
                    {review?.commentaire || "N/A"}
                  </td>
                  <td className="p-4 text-rose-600">
                    {review?.dateCreation
                      ? new Date(review.dateCreation).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setDeleteReviewId(review.id);
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
        {isDeleteModalOpen && deleteReviewId && (
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
              <p className="text-rose-600 mb-6">Supprimer cet avis ?</p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteReview}
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

export default AdminReviews;
