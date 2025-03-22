import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, X, ChevronLeft, Trash, Power } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useUsers } from "../../hooks/useUsers";
import { toast } from "react-toastify";
import api from "../../api/api";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { updateUser, blockUser, deleteUser, loading, error } = useUsers();
  const [activeSection, setActiveSection] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    country: "",
    role: user.role
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [countries, setCountries] = useState([]);

  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const scaleHover = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };
  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const menuItems = [
    { label: "Modifier les informations", action: "editInfo" },
    { label: "Modifier le mot de passe", action: "editPassword" },
    {
      label: user?.blocked ? "Activer le compte" : "Désactiver le compte",
      action: "deactivate",
    },
    { label: "Supprimer le compte", action: "delete" },
  ];

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags,cca3"
        );
        const data = await response.json();
        const sortedCountries = data
          .sort((a, b) => a.name.common.localeCompare(b.name.common))
          .map((c) => ({
            value: c.name.common,
            label: c.name.common,
            flag: c.flags.png,
          }));
        setCountries(sortedCountries);
      } catch (err) {
        toast.error("Erreur lors de la récupération des pays");
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (user) {
      setUserInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        address: user.address || "",
        country: user.country || "",
        role: user.role
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const customOption = ({ innerProps, label, data }) => (
    <div {...innerProps} className="flex items-center p-2 hover:bg-rose-50">
      <img src={data.flag} alt={label} className="w-6 h-4 mr-2" />
      <span>{label}</span>
    </div>
  );

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#f4c7c3",
      "&:hover": {
        borderColor: "#f4a8a0",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#f4c7c3" : "white",
      color: "black",
      "&:hover": {
        backgroundColor: "#fef1f0",
      },
    }),
  };

  const handleConfirm = async () => {
    try {
      switch (popupAction) {
        case "editInfo":
          await updateUser(user.id, userInfo);
          await updateProfile(userInfo);
          toast.success("Informations mises à jour !");
          break;

        case "editPassword":
          if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Les nouveaux mots de passe ne correspondent pas");
            return;
          }
          if (!passwordData.currentPassword || !passwordData.newPassword) {
            toast.error("Tous les champs de mot de passe sont requis");
            return;
          }
          await api.put(`admin/users/${user.id}/update-password`, {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          });
          await updateProfile({ password: passwordData.newPassword });
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          toast.success("Mot de passe mis à jour !");
          await logout(user.email);
          break;

        case "deactivate":
          if (user.blocked) {
            await api.put(`/admin/users/${user.id}/unblock`);
            toast.success("Compte activé !");
            await updateProfile({ ...user, blocked: false });
          } else {
            await blockUser(user.id);
            toast.success("Compte désactivé !");
            await logout(user.email);
          }
          break;

        case "delete":
          await deleteUser(user.id);
          toast.success("Compte supprimé !");
          await logout(user.email);
          break;

        default:
          break;
      }
    } catch (err) {
      toast.error(err.response?.data || "Une erreur est survenue");
    } finally {
      setIsPopupOpen(false);
      setActiveSection(null);
    }
  };

  const openPopup = (action) => {
    setPopupAction(action);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupAction(null);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto bg-rose-50/30 min-h-screen"
    >
      <h1 className="text-4xl font-semibold text-rose-700 mb-12 text-center">
        Paramètres
      </h1>

      {user?.blocked && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 mx-6 rounded">
          <p>
            Veuillez activer votre compte pour accéder à toutes les
            fonctionnalités.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <motion.aside
          className={`bg-white rounded-xl shadow-lg p-6 md:w-1/3 w-full ${
            activeSection ? "hidden md:block" : "block"
          }`}
        >
          <h2 className="text-2xl font-semibold text-rose-700 mb-6">Options</h2>
          <div className="space-y-4">
            {menuItems.map((item) => (
              <motion.button
                key={item.action}
                onClick={() => setActiveSection(item.action)}
                className="w-full bg-rose-600 text-white py-3 px-4 rounded-md hover:bg-rose-700 transition-colors font-semibold text-left"
                disabled={loading}
                {...scaleHover}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.aside>

        <motion.section
          className={`bg-white rounded-xl shadow-lg p-6 md:w-2/3 w-full ${
            activeSection ? "block" : "hidden md:block"
          }`}
        >
          {activeSection && (
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setActiveSection(null)}
                className="md:hidden text-rose-600 hover:text-rose-700 flex items-center gap-2"
              >
                <ChevronLeft size={24} /> Retour
              </button>
            </div>
          )}

          {activeSection === "editInfo" && (
            <div>
              <h2 className="text-2xl font-semibold text-rose-700 mb-6">
                Modifier les Informations
              </h2>
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  openPopup("editInfo");
                }}
              >
                <div className="flex justify-center mb-6">
                  <img
                    src="/pdp.webp"
                    alt="Profil"
                    className="w-24 h-24 rounded-full object-cover border-2 border-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-rose-600 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={userInfo.firstName}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, firstName: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-md"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-rose-600 mb-2">Nom</label>
                  <input
                    type="text"
                    value={userInfo.lastName}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, lastName: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-md"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-rose-600 mb-2">Email</label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, email: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-md"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-rose-600 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={userInfo.address}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, address: e.target.value })
                    }
                    className="w-full p-3 border border-rose-300 rounded-md"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-rose-600 font-medium mb-2">
                    Pays (optionnel)
                  </label>
                  <Select
                    options={countries}
                    value={
                      countries.find((c) => c.value === userInfo.country) ||
                      null
                    }
                    onChange={(selected) =>
                      setUserInfo({
                        ...userInfo,
                        country: selected ? selected.value : "",
                      })
                    }
                    placeholder="Sélectionnez un pays"
                    isDisabled={loading || countries.length === 0}
                    components={{ Option: customOption }}
                    styles={customStyles}
                    isClearable
                  />
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-rose-600 text-white py-3 rounded-md hover:bg-rose-700 transition-colors"
                  disabled={loading}
                  {...scaleHover}
                >
                  {loading ? "Sauvegarde..." : "Sauvegarder"}
                </motion.button>
              </form>
            </div>
          )}

          {activeSection === "editPassword" && (
            <div>
              <h2 className="text-2xl font-semibold text-rose-700 mb-6">
                Modifier le Mot de Passe
              </h2>
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  openPopup("editPassword");
                }}
              >
                <div>
                  <label className="block text-rose-600 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-md"
                    placeholder="Entrez votre mot de passe actuel"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-rose-600 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-md"
                    placeholder="Entrez votre nouveau mot de passe"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-rose-600 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-rose-300 rounded-md"
                    placeholder="Confirmez votre nouveau mot de passe"
                    disabled={loading}
                  />
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-rose-600 text-white py-3 rounded-md hover:bg-rose-700 transition-colors"
                  disabled={loading}
                  {...scaleHover}
                >
                  {loading ? "Changement..." : "Changer le mot de passe"}
                </motion.button>
              </form>
            </div>
          )}

          {activeSection === "deactivate" && (
            <div>
              <h2 className="text-2xl font-semibold text-rose-700 mb-6">
                {user.blocked ? "Activer le Compte" : "Désactiver le Compte"}
              </h2>
              <p className="text-rose-600 mb-6">
                {user.blocked
                  ? "Êtes-vous sûr de vouloir activer votre compte ?"
                  : "Êtes-vous sûr de vouloir désactiver votre compte ? Vous pourrez le réactiver plus tard."}
              </p>
              <motion.button
                onClick={() => openPopup("deactivate")}
                className="w-full bg-rose-600 text-white py-3 rounded-md hover:bg-rose-700 transition-colors"
                disabled={loading}
                {...scaleHover}
              >
                {loading
                  ? user.blocked
                    ? "Activation..."
                    : "Désactivation..."
                  : user.blocked
                  ? "Activer"
                  : "Désactiver"}
              </motion.button>
            </div>
          )}

          {activeSection === "delete" && (
            <div>
              <h2 className="text-2xl font-semibold text-rose-700 mb-6">
                Supprimer le Compte
              </h2>
              <p className="text-rose-600 mb-6">
                Attention ! La suppression est irréversible. Toutes vos données
                seront perdues.
              </p>
              <motion.button
                onClick={() => openPopup("delete")}
                className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors"
                disabled={loading}
                {...scaleHover}
              >
                {loading ? "Suppression..." : "Supprimer"}
              </motion.button>
            </div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 md:w-1/3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-rose-700">
                  Confirmer l'action
                </h3>
                <button
                  onClick={closePopup}
                  className="text-rose-600 hover:text-rose-700"
                  disabled={loading}
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-rose-600 mb-6">
                Êtes-vous sûr de vouloir{" "}
                {popupAction === "editInfo"
                  ? "modifier vos informations"
                  : popupAction === "editPassword"
                  ? "changer votre mot de passe"
                  : popupAction === "deactivate"
                  ? user.blocked
                    ? "activer votre compte"
                    : "désactiver votre compte"
                  : "supprimer votre compte"}{" "}
                ?
              </p>
              <div className="flex gap-4">
                <motion.button
                  onClick={handleConfirm}
                  className="flex-1 bg-rose-600 text-white py-2 rounded-md hover:bg-rose-700 transition-colors"
                  disabled={loading}
                  {...scaleHover}
                >
                  {loading ? "En cours..." : "Oui"}
                </motion.button>
                <motion.button
                  onClick={closePopup}
                  className="flex-1 bg-rose-100 text-rose-600 py-2 rounded-md hover:bg-rose-200 transition-colors"
                  disabled={loading}
                  {...scaleHover}
                >
                  Non
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;
