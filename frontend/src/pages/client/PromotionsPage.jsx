import { useEffect } from "react";
import { motion } from "framer-motion";
import { Percent } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Product from "../../components/Product";
import { usePromotions } from "../../hooks/usePromotions";
import { IMG_URL_BACKEND } from "../../constant";

const PromotionsPage = () => {
  const {
    promotions,
    fetchPromotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotions();

  useEffect(() => {
    // Récupérer toutes les promotions depuis le backend
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    if (promotionsError) {
      toast.error(promotionsError);
    }
  }, [promotionsError]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  // Mapper les promotions pour correspondre au format attendu par le composant Product
  const promotionProducts = promotions.map((promo) => ({
    id: promo.produit.id,
    nom: promo.produit.nom,
    prix: promo.produit.prix?.doubleValue || promo.produit.prix,
    prixOriginal:
      promo.produit.prixOriginal?.doubleValue || promo.produit.prixOriginal,
    imagePath: promo.produit.imagePath,
    avis: promo.produit.avis || [],
    categorie: promo.produit.categorie,
    stock: promo.produit.stock,
  }));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto bg-rose-50/30 min-h-screen"
    >
      <h1 className="text-4xl font-semibold text-rose-700 mb-8 text-center flex items-center justify-center gap-2">
        <Percent size={36} className="text-rose-600" />
        Promotions
      </h1>
      <p className="text-rose-600 text-center mb-12 max-w-2xl mx-auto">
        Profitez de nos offres exceptionnelles sur une sélection de produits
        cosmétiques de haute qualité.
      </p>

      <motion.section variants={staggerChildren}>
        {promotionsLoading ? (
          <p className="text-rose-600 text-center">
            Chargement des promotions...
          </p>
        ) : promotionProducts.length === 0 ? (
          <p className="text-rose-600 text-center">
            Aucune promotion disponible pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {promotionProducts.map((product) => (
              <Product key={product.id} product={product} viewMode="grid" />
            ))}
          </div>
        )}
      </motion.section>

      <motion.div variants={fadeIn} className="mt-12 text-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-rose-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-rose-700 transition-colors"
        >
          Voir tous les produits
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default PromotionsPage;
