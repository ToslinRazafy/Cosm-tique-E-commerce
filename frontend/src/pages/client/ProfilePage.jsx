import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Globe, Package, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useOrders } from "../../hooks/useOrders";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { user } = useAuth();
  const {
    profile,
    fetchProfile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();
  const {
    orders,
    fetchOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useOrders();

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchOrders();
    }
  }, [user?.id, fetchProfile, fetchOrders]);

  useEffect(() => {
    if (profileError) toast.error(profileError);
    if (ordersError) toast.error(ordersError);
  }, [profileError, ordersError]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const scaleHover = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto bg-rose-50/30 h-screen flex flex-col"
    >
      <h1 className="text-4xl font-semibold text-rose-700 mb-12 text-center flex-shrink-0">
        Mon Profil
      </h1>

      {(profileLoading || ordersLoading) && (
        <p className="text-rose-600 text-center">Chargement...</p>
      )}

      {!user ? (
        <p className="text-rose-600 text-center">
          Veuillez vous connecter pour voir votre profil.
        </p>
      ) : (
        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Informations utilisateur fixes */}
          <motion.section
            variants={staggerChildren}
            className="bg-white rounded-xl shadow-lg p-8 mb-8 flex-shrink-0"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-rose-700 flex items-center gap-2">
                <User size={28} className="text-rose-600" />
                Informations Personnelles
              </h2>
              <Link
                to="/settings"
                className="text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Edit size={20} /> Paramètres
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-rose-600 font-medium flex items-center gap-2">
                  <User size={18} /> Prénom
                </p>
                <p className="text-rose-800">{profile?.firstName || "N/A"}</p>
              </div>
              <div>
                <p className="text-rose-600 font-medium flex items-center gap-2">
                  <User size={18} /> Nom
                </p>
                <p className="text-rose-800">{profile?.lastName || "N/A"}</p>
              </div>
              <div>
                <p className="text-rose-600 font-medium flex items-center gap-2">
                  <Mail size={18} /> Email
                </p>
                <p className="text-rose-800">{user.email}</p>
              </div>
              <div>
                <p className="text-rose-600 font-medium flex items-center gap-2">
                  <MapPin size={18} /> Adresse
                </p>
                <p className="text-rose-800">{profile?.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-rose-600 font-medium flex items-center gap-2">
                  <Globe size={18} /> Pays
                </p>
                <p className="text-rose-800">{profile?.country || "N/A"}</p>
              </div>
            </div>
          </motion.section>

          {/* Historique des commandes scrollable */}
          <motion.section
            variants={staggerChildren}
            className="bg-white rounded-xl shadow-lg p-8 flex-grow overflow-y-auto"
          >
            <h2 className="text-2xl font-semibold text-rose-700 mb-6 flex items-center gap-2">
              <Package size={28} className="text-rose-600" />
              Historique des Commandes Récentes
            </h2>
            {orders.length === 0 ? (
              <p className="text-rose-600 text-center">
                Aucune commande récente.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map(
                  (
                    order // Limité à 5 pour "récent"
                  ) => (
                    <motion.div
                      key={order.id}
                      variants={fadeIn}
                      className="flex justify-between items-center p-4 bg-rose-50 rounded-md"
                    >
                      <div>
                        <p className="text-rose-700 font-medium">
                          Commande #{order.id}
                        </p>
                        <p className="text-rose-600 text-sm">
                          Date:{" "}
                          {new Date(order.dateCommande).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-rose-600 font-semibold">
                          {(order.total || 0).toFixed(2)} Ar
                        </p>
                        <p
                          className={`text-sm ${
                            order.statut === "DELIVERED"
                              ? "text-green-600"
                              : order.statut === "CANCELLED"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.statut || "N/A"}
                        </p>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            )}
            <div className="mt-6 text-center flex-shrink-0">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 bg-rose-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-rose-700 transition-colors"
                {...scaleHover}
              >
                Voir plus
              </Link>
            </div>
          </motion.section>
        </div>
      )}
    </motion.div>
  );
};

export default ProfilePage;
