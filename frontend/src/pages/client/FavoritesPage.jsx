import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import Product from "../../components/Product";
import { useCartFavorites } from "../../context/CartFavoritesContext";

const FavoritesPage = () => {
  const { favorites, favoritesError, user } = useCartFavorites();

  useEffect(() => {
    if (favoritesError) toast.error(favoritesError);
  }, [favoritesError]);

  // Vérification du chargement basé sur la présence des données et de l'utilisateur
  const isLoading = user?.id && !favorites;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto"
    >
      <h1 className="text-3xl font-semibold text-rose-700 mb-8 flex items-center gap-2">
        <Heart size={32} /> Vos Favoris
      </h1>
      {isLoading ? (
        <p className="text-rose-600 text-center">Chargement...</p>
      ) : !favorites?.length ? (
        <p className="text-rose-600 text-center">Aucun produit en favoris.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <Product
              key={item.produit.id}
              product={item.produit}
              viewMode="grid"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FavoritesPage;
