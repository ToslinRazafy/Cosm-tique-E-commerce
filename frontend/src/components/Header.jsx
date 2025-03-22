import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LogOut,
  Settings,
  User,
  ShoppingBag,
  Home,
  ShoppingCart,
  Trash2,
  Star,
  Percent,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { IMG_URL_BACKEND } from "../constant";
import { useCartFavorites } from "../context/CartFavoritesContext";
import { useEffect, useState } from "react";

const Header = () => {
  const {
    user,
    cart,
    favorites,
    cartLoading,
    cartError,
    favoritesError,
    onLogout,
    onUpdateCartItem,
    onRemoveFromCart,
  } = useCartFavorites();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (cartError) toast.error(cartError);
    if (favoritesError) toast.error(favoritesError);
  }, [cartError, favoritesError]);

  const navItems = [
    { label: "Accueil", href: "/home", icon: Home },
    { label: "Boutique", href: "/shop", icon: ShoppingBag },
    { label: "Nouveautés", href: "/new-arrivals", icon: Star },
    { label: "Promotions", href: "/promotions", icon: Percent },
    { label: "Favoris", href: "/favorites", icon: Heart },
    { label: "Panier", href: "/cart", icon: ShoppingCart },
  ];

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };

  const cartVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  const handleLogout = async () => {
    try {
      await onLogout(user.email);
      navigate("/login");
      toast.success("Déconnexion réussie");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la déconnexion");
    }
  };

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

  const cartTotal =
    cart?.items?.reduce(
      (sum, item) =>
        sum +
        (item.produit.prix?.doubleValue || item.produit.prix) * item.quantite,
      0
    ) || 0;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-md px-4 py-3 md:px-6 md:py-4 flex items-center justify-between"
      >
        <Link to="/home" className="flex items-center gap-2">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="text-rose-600 font-bold text-xl md:text-2xl"
          >
            CosmoPink
          </motion.span>
        </Link>

        <nav className="hidden md:flex gap-6 lg:gap-8">
          {navItems.map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={item.href}
                className={`text-rose-700 font-medium ${
                  location.pathname === item.href
                    ? "text-rose-500 border-b-2 border-rose-500"
                    : "hover:text-rose-500"
                }`}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative cursor-pointer"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <ShoppingCart className="text-rose-600" size={24} />
            {cart?.items?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart?.items?.length}
              </span>
            )}
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative cursor-pointer"
            onClick={() => navigate("/favorites")}
          >
            <Heart className="text-rose-600" size={24} />
            {favorites?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {favorites?.length}
              </span>
            )}
          </motion.div>

          {user ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img
                src={
                "/pdp.webp"
                }
                alt="profile"
                className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-full border-2 border-rose-300"
              />
            </motion.div>
          ) : (
            <Link
              to="/login"
              className="text-rose-600 font-semibold hover:text-rose-700"
            >
              Connexion
            </Link>
          )}

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-rose-600" />
            ) : (
              <Menu size={24} className="text-rose-600" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white shadow-md md:hidden p-4"
            >
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 text-rose-700 hover:text-rose-500 ${
                    location.pathname === item.href ? "text-rose-500" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  className="block py-2 text-rose-700 hover:text-rose-500 w-full text-left"
                >
                  Déconnexion
                </button>
              )}
            </motion.nav>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProfileOpen && user && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-4 top-12 md:top-14 bg-white shadow-lg rounded-xl border border-rose-200 w-56 p-4 z-50"
            >
              <div className="mb-2">
                <span className="text-rose-700 font-semibold block">
                  {user.firstName}
                </span>
                <span className="text-rose-500 text-sm">{user.email}</span>
              </div>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-2 hover:bg-rose-50 rounded-md text-rose-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={18} /> Profil
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 p-2 hover:bg-rose-50 rounded-md text-rose-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={18} /> Paramètres
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 hover:bg-rose-50 rounded-md text-rose-700 w-full text-left"
                  >
                    <LogOut size={18} /> Déconnexion
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCartOpen && (
            <motion.div
              variants={cartVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-4 top-12 md:top-14 bg-white shadow-lg rounded-xl border border-rose-200 w-72 md:w-80 max-h-[70vh] overflow-y-auto p-4 z-50"
            >
              <h3 className="text-rose-700 font-semibold mb-4">Panier</h3>
              {cartLoading ? (
                <p className="text-rose-500">Chargement...</p>
              ) : !cart?.items?.length ? (
                <p className="text-rose-500">Votre panier est vide</p>
              ) : (
                <>
                  <ul className="space-y-4">
                    {cart.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 p-2 bg-rose-50 rounded-md"
                      >
                        <img
                          src={
                            item.produit.imagePath
                              ? `${IMG_URL_BACKEND}${item.produit.imagePath}`
                              : "/img.jpg"
                          }
                          alt={item.produit.nom}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p className="text-rose-700 font-medium">
                            {item.produit.nom}
                          </p>
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
                              className="w-16 p-1 border border-rose-300 rounded text-rose-700"
                              min="1"
                              max={item.produit.stock}
                            />
                            <span className="text-rose-600">
                              {(item.produit.prix?.doubleValue ||
                                item.produit.prix) *
                                item.quantite.toFixed(2)}{" "}
                              Ar
                            </span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          <Trash2 className="text-rose-600" size={18} />
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-rose-200">
                    <p className="text-rose-700 font-semibold">
                      Total: {cartTotal.toFixed(2)} Ar
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate("/checkout");
                      }}
                      className="mt-2 w-full bg-rose-600 text-white py-2 rounded-md hover:bg-rose-700"
                    >
                      Commander
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      <div className="h-16 md:h-20" />
    </>
  );
};

export default Header;
