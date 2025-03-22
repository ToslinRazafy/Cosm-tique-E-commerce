import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useReviews } from "../../hooks/useReviews";
import { IMG_URL_BACKEND } from "../../constant";
import { useCartFavorites } from "../../context/CartFavoritesContext"; // Import du contexte
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Utilisation du contexte useCartFavorites
  const {
    user,
    cart,
    favorites,
    cartError,
    favoritesError,
    onAddToCart,
    onAddToFavorites,
    onRemoveFromFavorites,
  } = useCartFavorites();

  const {
    reviews,
    fetchReviews,
    addReview,
    loading: reviewsLoading,
    error: reviewsError,
  } = useReviews();
  const { fetchProductById } = useProducts();
  const { fetchCategories, categories } = useCategories();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 0, comment: "" });

  const fetchProduit = async () => {
    const prod = await fetchProductById(id);
    setProduct(prod);
  };

  useEffect(() => {
    fetchProduit();
    fetchReviews(false, id);
  }, [id, fetchReviews, fetchProductById]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (cartError) toast.error(cartError);
    if (favoritesError) toast.error(favoritesError);
    if (reviewsError) toast.error(reviewsError);
  }, [cartError, favoritesError, reviewsError]);

  if (!product)
    return <div className="text-rose-600 text-center">Chargement...</div>;

  const isFavorite =
    favorites?.some((fav) => fav?.produit?.id === product.id) || false;
  const prix = product.prix?.doubleValue || product.prix;
  const prixOriginal =
    product.prixOriginal?.doubleValue || product.prixOriginal;
  const isOutOfStock = product.stock === 0;

  const handleQuantityChange = (e) => {
    const value = Math.max(
      1,
      Math.min(product.stock, parseInt(e.target.value) || 1)
    );
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Connectez-vous pour ajouter au panier");
      navigate("/login");
      return;
    }
    if (isOutOfStock) {
      toast.error("Produit en rupture de stock");
      return;
    }
    try {
      await onAddToCart(product.id, quantity);
      toast.success("Produit ajouté au panier");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout au panier");
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Connectez-vous pour gérer les favoris");
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Connectez-vous pour laisser un avis");
      navigate("/login");
      return;
    }
    try {
      await addReview(product.id, review.rating, review.comment, user.id);
      setReview({ rating: 0, comment: "" });
      toast.success("Avis soumis avec succès");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la soumission de l'avis");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={
            product.imagePath
              ? `${IMG_URL_BACKEND}${product.imagePath}`
              : "/img.jpg"
          }
          alt={product.nom}
          className="w-full h-96 object-cover rounded-lg"
        />
        <div>
          <h1 className="text-3xl font-semibold text-rose-700 mb-4">
            {product.nom}
          </h1>
          <p className="text-rose-500 mb-2">
            {categories.find((cat) =>
              cat.produits.some((p) => p.id === product.id)
            )?.nom || "N/A"}
          </p>
          <div className="flex items-center gap-2 mb-4">
            {prixOriginal && prixOriginal > prix ? (
              <>
                <p className="text-rose-400 line-through">
                  {prixOriginal.toFixed(2)} Ar
                </p>
                <p className="text-rose-600 font-semibold text-2xl">
                  {prix.toFixed(2)} Ar
                </p>
              </>
            ) : (
              <p className="text-rose-600 font-semibold text-2xl">
                {prix.toFixed(2)} Ar
              </p>
            )}
          </div>
          <p
            className={`text-sm mb-4 ${
              product.stock > 0 ? "text-rose-600" : "text-red-600"
            }`}
          >
            Stock: {product.stock > 0 ? product.stock : "Rupture de stock"}
          </p>
          <p className="text-rose-600 mb-2">
            Marque: {product.marque || "N/A"}
          </p>
          <p className="text-rose-600 mb-2">
            Ingrédients: {product.ingredients || "N/A"}
          </p>
          <p className="text-rose-600 mb-6">
            Date d'expiration: {product.dateExpiration || "N/A"}
          </p>
          <p className="text-rose-600 mb-6">
            {product.description || "Pas de description disponible"}
          </p>
          <div className="flex items-center gap-4 mb-6">
            {!isOutOfStock && (
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={product.stock}
                className="w-20 p-2 border border-rose-300 rounded-md"
              />
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className={`flex items-center gap-2 py-2 px-6 rounded-md ${
                isOutOfStock
                  ? "bg-rose-300 text-white cursor-not-allowed"
                  : "bg-rose-600 text-white hover:bg-rose-700"
              }`}
              disabled={isOutOfStock}
            >
              <ShoppingBag size={20} />{" "}
              {isOutOfStock ? "Indisponible" : "Ajouter au panier"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFavorite}
              className={`flex items-center gap-2 py-2 px-4 rounded-md ${
                isFavorite
                  ? "bg-rose-600 text-white"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              <Heart size={20} fill={isFavorite ? "white" : "none"} /> Favori
            </motion.button>
          </div>

          {/* Section Avis */}
          <div>
            <h3 className="text-xl font-semibold text-rose-700 mb-4">Avis</h3>
            {reviewsLoading ? (
              <p className="text-rose-600">Chargement des avis...</p>
            ) : reviews.length === 0 ? (
              <p className="text-rose-600">Aucun avis pour ce produit.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-rose-50 p-4 rounded-md">
                    <div className="flex items-center gap-1 mb-2">
                      <p className="text-rose-700 font-medium mt-2">
                        {rev.utilisateur?.firstName}{" "}
                        {rev.utilisateur.lastName ?? ""}
                      </p>
                      <Star className="text-yellow-400" size={16} />
                      <span className="text-rose-600">{rev.note}/5</span>
                    </div>
                    <p className="text-rose-600 italic">"{rev.commentaire}"</p>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-rose-600 mb-2">Note</label>
                <select
                  value={review.rating}
                  onChange={(e) =>
                    setReview({ ...review, rating: parseInt(e.target.value) })
                  }
                  className="w-full p-3 border border-rose-300 rounded-md"
                  required
                >
                  <option value="0">Sélectionner</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-rose-600 mb-2">Commentaire</label>
                <textarea
                  value={review.comment}
                  onChange={(e) =>
                    setReview({ ...review, comment: e.target.value })
                  }
                  className="w-full p-3 border border-rose-300 rounded-md"
                  rows="4"
                  required
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-rose-600 text-white py-3 rounded-md hover:bg-rose-700 transition-colors"
              >
                Soumettre
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;
