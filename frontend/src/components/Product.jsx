import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { IMG_URL_BACKEND } from "../constant";
import { useCartFavorites } from "../context/CartFavoritesContext";
import { useCategories } from "../hooks/useCategories";

const Product = ({ product, viewMode }) => {
  const {
    user,
    onAddToCart,
    onAddToFavorites,
    onRemoveFromFavorites,
    favorites,
  } = useCartFavorites();
  const { categories, fetchCategories } = useCategories();
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id, fetchCategories]);

  const isFavorite =
    favorites?.some((fav) => fav?.produit?.id === product.id) || false;
  const prix = product.prix?.doubleValue || product.prix;
  const prixOriginal =
    product.prixOriginal?.doubleValue || product.prixOriginal;

  const categoryName =
    categories.find((cat) => cat.produits.some((p) => p.id === product.id))
      ?.nom || "N/A";

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Connectez-vous pour ajouter aux favoris");
      navigate("/login");
      return;
    }
    try {
      if (isFavorite) {
        await onRemoveFromFavorites(product.id);
        toast.success("Retiré des favoris");
      } else {
        await onAddToFavorites(product.id);
        toast.success("Ajouté aux favoris");
      }
    } catch (err) {
      toast.error(err.message || "Erreur avec les favoris");
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Connectez-vous pour ajouter au panier");
      navigate("/login");
      return;
    }
    if (product.stock === 0) {
      toast.error("Produit en rupture de stock");
      return;
    }
    try {
      await onAddToCart(product.id, quantity);
      toast.success(`${product.nom} ajouté au panier (${quantity})`);
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout au panier");
    }
  };

  const isOutOfStock = product.stock === 0;
  const hasDiscount = prixOriginal > 0 && prixOriginal > prix;
  const discountPercentage = hasDiscount
    ? Math.round(((prixOriginal - prix) / prixOriginal) * 100)
    : 0;

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
        viewMode === "list"
          ? "flex flex-col sm:flex-row items-start gap-4 p-4"
          : "flex flex-col"
      }`}
    >
      <div className="relative flex-shrink-0">
        <Link to={`/product/${product.id}`}>
          <img
            src={
              product.imagePath
                ? `${IMG_URL_BACKEND}${product.imagePath}`
                : "/img.jpg"
            }
            alt={product.nom}
            className={
              viewMode === "list"
                ? "w-full sm:w-48 h-48 object-cover rounded-md"
                : "w-full h-48 object-cover"
            }
          />
        </Link>
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <div
        className={`flex-1 ${
          viewMode === "list"
            ? "flex flex-col justify-between w-full sm:pl-4"
            : "p-4"
        }`}
      >
        <div>
          <Link
            to={`/product/${product.id}`}
            className="text-lg font-medium text-rose-700 hover:text-rose-500"
          >
            {product.nom}
          </Link>
          <p className="text-rose-500 text-sm mt-1">{categoryName}</p>
          <div
            className={`mt-2 flex items-center gap-2 ${
              viewMode === "list" ? "flex-wrap" : ""
            }`}
          >
            {hasDiscount ? (
              <>
                <p className="text-rose-400 line-through">
                  {prixOriginal.toFixed(2)} Ar
                </p>
                <p className="text-rose-600 font-semibold">
                  {prix.toFixed(2)} Ar
                </p>
              </>
            ) : (
              <p className="text-rose-600 font-semibold">
                {prix.toFixed(2)} Ar
              </p>
            )}
          </div>
          <p
            className={`text-sm mt-1 ${
              product.stock > 0 ? "text-rose-600" : "text-red-600"
            }`}
          >
            Stock: {product.stock > 0 ? product.stock : "Rupture"}
          </p>
        </div>

        <div
          className={`flex gap-2 ${
            viewMode === "list"
              ? "mt-4 sm:mt-0 sm:flex-row items-center justify-between"
              : "mt-4"
          }`}
        >
          {!isOutOfStock && (
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(product.stock, parseInt(e.target.value) || 1)
                  )
                )
              }
              className="w-20 p-2 border border-rose-300 rounded-md text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              min="1"
              max={product.stock}
            />
          )}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleAddToCart}
              className={`flex items-center gap-2 py-2 px-4 rounded-md ${
                isOutOfStock
                  ? "bg-rose-300 text-white cursor-not-allowed"
                  : "bg-rose-600 text-white hover:bg-rose-700"
              }`}
              disabled={isOutOfStock}
            >
              <ShoppingBag size={16} />{" "}
              {isOutOfStock ? "Indisponible" : "Ajouter"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={toggleFavorite}
              className={`flex items-center gap-2 py-2 px-4 rounded-md ${
                isFavorite
                  ? "bg-rose-600 text-white"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              <Heart size={16} fill={isFavorite ? "white" : "none"} /> Favori
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

Product.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nom: PropTypes.string.isRequired,
    prix: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
    prixOriginal: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    stock: PropTypes.number.isRequired,
    imagePath: PropTypes.string,
    avis: PropTypes.arrayOf(
      PropTypes.shape({
        note: PropTypes.number,
      })
    ),
  }).isRequired,
  viewMode: PropTypes.oneOf(["grid", "list"]).isRequired,
};

export default Product;
