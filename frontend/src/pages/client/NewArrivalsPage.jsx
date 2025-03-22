import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Product from "../../components/Product";
import { useProducts } from "../../hooks/useProducts";

const NewArrivalsPage = () => {
  const {
    products,
    fetchProducts,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (productsError) {
      toast.error(productsError);
    }
  }, [productsError]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const newArrivals = shuffleArray(
    products.filter((product) => product.stock > 0)
  ).slice(0, 12);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto bg-rose-50/30 min-h-screen"
    >
      <h1 className="text-4xl font-semibold text-rose-700 mb-8 text-center">
        Nouveautés
      </h1>
      <p className="text-rose-600 text-center mb-12 max-w-2xl mx-auto">
        Découvrez nos derniers produits cosmétiques, conçus pour sublimer votre
        beauté avec innovation et naturel.
      </p>

      <motion.section variants={staggerChildren}>
        {productsLoading ? (
          <p className="text-rose-600 text-center">
            Chargement des nouveautés...
          </p>
        ) : newArrivals.length === 0 ? (
          <p className="text-rose-600 text-center">
            Aucune nouveauté disponible pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
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
          Voir toute la boutique
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default NewArrivalsPage;
