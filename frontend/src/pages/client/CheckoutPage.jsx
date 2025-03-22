import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Smartphone,
  DollarSign,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../hooks/useCart";
import { useOrders } from "../../hooks/useOrders";
import { IMG_URL_BACKEND } from "../../constant";

const CheckoutPage = () => {
  const {
    cart,
    updateCartItem,
    removeFromCart,
    fetchCart,
    clearCart,
    loading: cartLoading,
    error: cartError,
  } = useCart();
  const { createOrder, error: orderError } = useOrders();
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState("fedex");
  const [paymentDetails, setPaymentDetails] = useState({
    email: "",
    paymentMethod: "mvola",
    phoneNumber: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    otherDetails: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // État pour le loader

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const shippingOptions = [
    {
      name: "Livraison Fedex",
      value: "fedex",
      cost: 9.0,
      duration: "2-4 Jours",
    },
    {
      name: "Livraison Standard",
      value: "fedex2",
      cost: 0.0,
      duration: "4-7 Jours",
    },
  ];

  const paymentMethods = [
    {
      value: "mvola",
      label: "Mvola",
      icon: <Smartphone size={20} className="text-rose-600" />,
    },
    {
      value: "orange_money",
      label: "Orange Money",
      icon: <Smartphone size={20} className="text-rose-600" />,
    },
    {
      value: "airtel_money",
      label: "Airtel Money",
      icon: <Smartphone size={20} className="text-rose-600" />,
    },
    {
      value: "visa",
      label: "Carte Visa",
      icon: <CreditCard size={20} className="text-rose-600" />,
    },
    {
      value: "other",
      label: "Autre",
      icon: <DollarSign size={20} className="text-rose-600" />,
    },
  ];

  useEffect(() => {
    if (cartError) toast.error(cartError);
    if (orderError) toast.error(orderError);
  }, [cartError, orderError]);

  const subtotal =
    cart?.items?.reduce(
      (sum, item) =>
        sum +
        (item.produit.prix?.doubleValue || item.produit.prix) * item.quantite,
      0
    ) || 0;

  const shippingCost =
    shippingOptions.find((opt) => opt.value === shippingMethod)?.cost || 0;
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = async (itemId, change) => {
    const item = cart.items.find((c) => c.id === itemId);
    const newQuantity = Math.max(1, item.quantite + change);
    if (newQuantity <= item.produit.stock) {
      await updateCartItem(itemId, newQuantity);
      fetchCart();
    } else {
      toast.error("Quantité dépasse le stock disponible");
    }
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
    fetchCart();
    toast.success("Article supprimé");
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!paymentDetails.email) {
      toast.error("Veuillez entrer votre email");
      return;
    }
    if (!paymentDetails.paymentMethod) {
      toast.error("Veuillez sélectionner une méthode de paiement");
      return;
    }

    const paymentSpecificDetails = {};
    if (
      ["mvola", "orange_money", "airtel_money"].includes(
        paymentDetails.paymentMethod
      )
    ) {
      if (!paymentDetails.phoneNumber) {
        toast.error("Veuillez entrer votre numéro de téléphone");
        return;
      }
      paymentSpecificDetails.phoneNumber = paymentDetails.phoneNumber;
    } else if (paymentDetails.paymentMethod === "visa") {
      if (
        !paymentDetails.cardNumber ||
        !paymentDetails.expiryDate ||
        !paymentDetails.cvv
      ) {
        toast.error("Veuillez remplir tous les champs de la carte");
        return;
      }
      paymentSpecificDetails.cardNumber = paymentDetails.cardNumber;
      paymentSpecificDetails.expiryDate = paymentDetails.expiryDate;
      paymentSpecificDetails.cvv = paymentDetails.cvv;
    } else if (
      paymentDetails.paymentMethod === "other" &&
      !paymentDetails.otherDetails
    ) {
      toast.error("Veuillez préciser les détails pour 'Autre'");
      return;
    }

    setIsSubmitting(true); // Active le loader
    try {
      await createOrder({
        shippingMethod: shippingOptions.find(
          (opt) => opt.value === shippingMethod
        )?.name,
        shippingCost,
        paymentMethod: paymentDetails.paymentMethod,
        email: paymentDetails.email,
        paymentDetails: paymentSpecificDetails,
      });
      await clearCart();
      toast.success(
        "Commande passée avec succès, Veuillez vérifier votre email !"
      );
      navigate("/order-confirmation");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la commande");
    } finally {
      setIsSubmitting(false); // Désactive le loader
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto bg-rose-50/30 min-h-screen"
    >
      <h1 className="text-4xl font-semibold text-rose-700 mb-8 text-center flex items-center justify-center gap-2">
        <ShoppingBag size={36} className="text-rose-600" />
        Validation de la Commande
      </h1>
      <p className="text-rose-600 text-center mb-12 max-w-2xl mx-auto">
        Vérifiez votre commande, choisissez une méthode de livraison et entrez
        vos informations de paiement.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={fadeIn} className="space-y-6">
          <h2 className="text-2xl font-semibold text-rose-700 mb-4">
            Résumé de la Commande
          </h2>
          <p className="text-rose-600 mb-4">
            Vérifiez les articles et choisissez une méthode de livraison.
          </p>
          {cartLoading ? (
            <p className="text-rose-600">Chargement...</p>
          ) : !cart?.items?.length ? (
            <p className="text-rose-600">Votre panier est vide.</p>
          ) : (
            <>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4 bg-white rounded-md shadow-md border border-rose-100"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.produit.imagePath
                            ? `${IMG_URL_BACKEND}${item.produit.imagePath}`
                            : "https://via.placeholder.com/80"
                        }
                        alt={item.produit.nom}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-grow">
                        <h3 className="text-rose-700 font-medium">
                          {item.produit.nom}
                        </h3>
                        <p className="text-rose-600">
                          {(
                            item.produit.prix?.doubleValue || item.produit.prix
                          ).toFixed(2)}{" "}
                          Ar
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="text-rose-600 hover:text-rose-700"
                          >
                            <Minus size={16} />
                          </motion.button>
                          <span className="text-rose-600">{item.quantite}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="text-rose-600 hover:text-rose-700"
                          >
                            <Plus size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-rose-600 font-semibold">
                        {(item.produit.prix?.doubleValue || item.produit.prix) *
                          item.quantite.toFixed(2)}{" "}
                        Ar
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-rose-700 mb-4">
                  Méthodes de Livraison
                </h3>
                {shippingOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-4 bg-white rounded-md border border-rose-100 mb-2 cursor-pointer hover:bg-rose-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={option.value}
                      checked={shippingMethod === option.value}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div className="flex-grow">
                      <p className="text-rose-700 font-medium">{option.name}</p>
                      <p className="text-rose-600 text-sm">{option.duration}</p>
                    </div>
                    <p className="text-rose-600">{option.cost.toFixed(2)} Ar</p>
                  </label>
                ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.div variants={fadeIn}>
          <div className="bg-white p-6 rounded-md shadow-md border border-rose-100">
            <h2 className="text-2xl font-semibold text-rose-700 mb-4 flex items-center gap-2">
              <CreditCard size={24} /> Détails de Paiement
            </h2>
            <p className="text-rose-600 mb-6">
              Fournissez votre email et choisissez une méthode de paiement.
            </p>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-rose-600 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={paymentDetails.email}
                  onChange={handleInputChange}
                  placeholder="votre.email@example.com"
                  className="w-full p-3 border border-rose-300 rounded-md text-rose-600 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                  required
                />
              </div>

              <div>
                <label className="block text-rose-600 mb-2">
                  Méthode de Paiement
                </label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className="flex items-center gap-3 p-3 bg-rose-50 rounded-md border border-rose-100 cursor-pointer hover:bg-rose-100 transition-colors"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentDetails.paymentMethod === method.value}
                        onChange={handleInputChange}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <div className="flex items-center gap-2">
                        {method.icon}
                        <span className="text-rose-700">{method.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {["mvola", "orange_money", "airtel_money"].includes(
                paymentDetails.paymentMethod
              ) && (
                <div>
                  <label className="block text-rose-600 mb-2">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={paymentDetails.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Ex: 034 12 345 67"
                    className="w-full p-3 border border-rose-300 rounded-md text-rose-600 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                    required
                  />
                </div>
              )}
              {paymentDetails.paymentMethod === "visa" && (
                <>
                  <div>
                    <label className="block text-rose-600 mb-2">
                      Numéro de Carte
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 border border-rose-300 rounded-md text-rose-600 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-rose-600 mb-2">
                        Date d'Expiration
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentDetails.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        className="w-full p-3 border border-rose-300 rounded-md text-rose-600 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-rose-600 mb-2">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentDetails.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full p-3 border border-rose-300 rounded-md text-rose-600 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              {paymentDetails.paymentMethod === "other" && (
                <div>
                  <label className="block text-rose-600 mb-2">
                    Détails Supplémentaires
                  </label>
                  <textarea
                    name="otherDetails"
                    value={paymentDetails.otherDetails}
                    onChange={handleInputChange}
                    placeholder="Précisez ici les détails de paiement"
                    className="w-full p-3 border border-rose-300 rounded-md text-rose-600 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                    required
                  />
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-rose-600">Sous-total</span>
                  <span className="text-rose-600">
                    {subtotal.toFixed(2)} Ar
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-600">Livraison</span>
                  <span className="text-rose-600">
                    {shippingCost.toFixed(2)} Ar
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-rose-700">
                  <span>Total</span>
                  <span>{total.toFixed(2)} Ar</span>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-md transition-colors mt-4 flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? "bg-rose-400 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-700"
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Traitement...
                  </>
                ) : (
                  "Passer la Commande"
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
