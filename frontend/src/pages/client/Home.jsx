import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Product from "../../components/Product";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { usePromotions } from "../../hooks/usePromotions";
import { IMG_URL_BACKEND } from "../../constant";

const Home = () => {
  const {
    products,
    fetchProducts,
    loading: productsLoading,
    error: productsError,
  } = useProducts();
  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const {
    promotions,
    fetchPromotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotions();

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchPromotions();
  }, [fetchProducts, fetchCategories, fetchPromotions]);

  useEffect(() => {
    if (promotions.length > 0) {
      const interval = setInterval(
        () => setCurrentSlide((prev) => (prev + 1) % promotions.length),
        5000
      );
      return () => clearInterval(interval);
    }
  }, [promotions.length]);

  useEffect(() => {
    if (productsError) toast.error(productsError);
    if (categoriesError) toast.error(categoriesError);
    if (promotionsError) toast.error(promotionsError);
  }, [productsError, categoriesError, promotionsError]);

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

  const safeProducts = Array.isArray(products) ? products : [];
  const shuffledProducts = shuffleArray(safeProducts);
  const popularProducts = shuffledProducts.slice(0, 3);
  const recommendedProducts = shuffledProducts.slice(3, 6);
  const newArrivals = shuffledProducts.filter((p) => p.stock > 0).slice(0, 3);

  const slides = promotions.map((promo) => ({
    title: promo.produit.nom,
    img: promo.produit.imagePath
      ? `${IMG_URL_BACKEND}${promo.produit.imagePath}`
      : "/img.jpg",
    href: `/product/${promo.produit.id}`,
  }));

  return (
    <div className="bg-rose-50/30">
      <motion.section className="relative h-[60vh] overflow-hidden">
        <AnimatePresence>
          {slides.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slides[currentSlide].img})` }}
            >
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {slides[currentSlide].title}
                  </h1>
                  <Link
                    to={slides[currentSlide].href}
                    className="inline-flex items-center gap-2 bg-rose-600 text-white py-3 px-6 rounded-full hover:bg-rose-700 transition-colors"
                  >
                    <ShoppingBag size={20} /> Découvrir
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.section
        viewport={{ once: true }}
        variants={staggerChildren}
        className="container mx-auto px-4 py-12"
      >
        <h2 className="text-3xl font-semibold text-rose-700 mb-8 text-center">
          Catégories
        </h2>
        {categoriesLoading ? (
          <p className="text-rose-600 text-center">Chargement...</p>
        ) : categories.length === 0 ? (
          <p className="text-rose-600 text-center">
            Aucune catégorie disponible
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <motion.a
                key={category.id}
                href={`/shop?categoryId=${category.id}`}
                variants={fadeIn}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-md overflow-hidden text-center hover:shadow-lg transition-shadow"
              >
                <img
                  src={"https://via.placeholder.com/200x200?text=Catégorie"}
                  alt={category.nom}
                  className="w-full h-32 object-cover"
                />
                <p className="p-4 text-rose-700 font-medium">{category.nom}</p>
              </motion.a>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
        className="container mx-auto px-4 py-12 bg-rose-100/50"
      >
        <h2 className="text-3xl font-semibold text-rose-700 mb-8 text-center">
          Produits Populaires
        </h2>
        {productsLoading ? (
          <p className="text-rose-600 text-center">Chargement...</p>
        ) : popularProducts.length === 0 ? (
          <p className="text-rose-600 text-center">
            Aucun produit populaire disponible
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {popularProducts.map((product) => (
              <Product key={product.id} product={product} viewMode="grid" />
            ))}
          </div>
        )}
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
        className="container mx-auto px-4 py-12"
      >
        <h2 className="text-3xl font-semibold text-rose-700 mb-8 text-center">
          Recommandations pour vous
        </h2>
        {productsLoading ? (
          <p className="text-rose-600 text-center">Chargement...</p>
        ) : recommendedProducts.length === 0 ? (
          <p className="text-rose-600 text-center">
            Aucune recommandation disponible
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recommendedProducts.map((product) => (
              <Product key={product.id} product={product} viewMode="grid" />
            ))}
          </div>
        )}
      </motion.section>

      {newArrivals.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="container mx-auto px-4 py-12 bg-rose-100/20"
        >
          <h2 className="text-3xl font-semibold text-rose-700 mb-8 text-center">
            Nouveaux Arrivages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {newArrivals.map((product) => (
              <Product key={product.id} product={product} viewMode="grid" />
            ))}
          </div>
        </motion.section>
      )}

      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-rose-600 text-white py-12 text-center"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-4">
            Offre Spéciale : -20% sur tout !
          </h2>
          <p className="mb-6">
            Code : <strong>COSMO20</strong>
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-rose-600 py-3 px-6 rounded-full hover:bg-rose-100 transition-colors"
          >
            Acheter maintenant
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
