import { useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCartFavorites } from "../../context/CartFavoritesContext"; // Utilisation du contexte au lieu de useCart
import { IMG_URL_BACKEND } from "../../constant";

const CartPage = () => {
  const { cart, cartLoading, cartError, onUpdateCartItem, onRemoveFromCart } =
    useCartFavorites();

  useEffect(() => {
    if (cartError) toast.error(cartError);
  }, [cartError]);

  const subtotal =
    cart?.items?.reduce(
      (sum, item) =>
        sum +
        (item.produit.prix?.doubleValue || item.produit.prix) * item.quantite,
      0
    ) || 0;

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      await onUpdateCartItem(itemId, quantity);
      toast.success("Quantité mise à jour");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await onRemoveFromCart(itemId);
      toast.success("Produit retiré du panier");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto flex flex-col" // Hauteur pleine écran
    >
      {/* Titre fixe */}
      <h1 className="text-3xl font-semibold text-rose-700 mb-8 flex items-center gap-2 flex-shrink-0">
        <ShoppingCart size={32} /> Votre Panier
      </h1>

      {/* Section scrollable des produits */}
      {cartLoading ? (
        <p className="text-rose-600 text-center">Chargement...</p>
      ) : !cart?.items?.length ? (
        <p className="text-rose-600 text-center">Votre panier est vide.</p>
      ) : (
        <div className="flex-grow overflow-y-auto">
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-rose-50 rounded-md"
              >
                <img
                  src={
                    item.produit.imagePath
                      ? `${IMG_URL_BACKEND}${item.produit.imagePath}`
                      : "/img.jpg"
                  }
                  alt={item.produit.nom}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <h3 className="text-rose-700 font-medium">
                    {item.produit.nom}
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.quantite}
                      onChange={(e) =>
                        handleUpdateQuantity(
                          item.id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-16 p-1 border border-rose-300 rounded text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      min="1"
                      max={item.produit.stock}
                    />
                    <span className="text-rose-600">
                      {(item.produit.prix?.doubleValue || item.produit.prix) *
                        item.quantite.toFixed(2)}{" "}
                      Ar
                    </span>
                  </div>
                  <p className="text-rose-600 text-sm">
                    Stock restant: {item.produit.stock}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRemoveFromCart(item.id)}
                >
                  <Trash2 className="text-rose-600" size={20} />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total fixe en bas */}
      {cart?.items?.length > 0 && (
        <div className="p-4 bg-rose-100 rounded-md">
          <div className="space-y-2">
            <div className="flex justify-between font-semibold text-xl">
              <p className="text-rose-700">Total :</p>
              <p className="text-rose-700">{subtotal.toFixed(2)} Ar</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/checkout"
              className="mt-4 w-full bg-rose-600 text-white py-3 rounded-md hover:bg-rose-700 transition-colors block text-center"
            >
              Passer la commande
            </Link>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CartPage;
