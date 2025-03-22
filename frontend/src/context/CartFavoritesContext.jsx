import { createContext, useContext, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useFavorites } from "../hooks/useFavorites";

const CartFavoritesContext = createContext();

export const useCartFavorites = () => {
  const context = useContext(CartFavoritesContext);
  if (!context) {
    throw new Error(
      "useCartFavorites must be used within a CartFavoritesProvider"
    );
  }
  return context;
};

export const CartFavoritesProvider = ({ children }) => {
  const { user, logout } = useAuth();
  const {
    cart,
    fetchCart,
    updateCartItem,
    removeFromCart,
    addToCart,
    loading: cartLoading,
    error: cartError,
  } = useCart();
  const {
    favorites,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    error: favoritesError,
  } = useFavorites();

  useEffect(() => {
    if (user?.id) {
      fetchCart();
      fetchFavorites();
    }
  }, [user?.id, fetchCart, fetchFavorites]);

  const handleLogout = async (email) => {
    await logout(email);
    fetchCart(); // Réinitialiser le panier
    fetchFavorites(); // Réinitialiser les favoris
  };

  const handleUpdateCartItem = async (itemId, quantity) => {
    await updateCartItem(itemId, quantity);
    await fetchCart();
  };

  const handleRemoveFromCart = async (itemId) => {
    await removeFromCart(itemId);
    await fetchCart();
  };

  const handleAddToCart = async (productId, quantity) => {
    await addToCart(productId, quantity);
    await fetchCart();
  };

  const handleAddToFavorites = async (productId) => {
    await addToFavorites(productId);
    await fetchFavorites();
  };

  const handleRemoveFromFavorites = async (productId) => {
    await removeFromFavorites(productId);
    await fetchFavorites();
  };

  const value = {
    user,
    cart,
    favorites,
    cartLoading,
    cartError,
    favoritesError,
    onLogout: handleLogout,
    onUpdateCartItem: handleUpdateCartItem,
    onRemoveFromCart: handleRemoveFromCart,
    onAddToCart: handleAddToCart,
    onAddToFavorites: handleAddToFavorites,
    onRemoveFromFavorites: handleRemoveFromFavorites,
  };

  return (
    <CartFavoritesContext.Provider value={value}>
      {children}
    </CartFavoritesContext.Provider>
  );
};
