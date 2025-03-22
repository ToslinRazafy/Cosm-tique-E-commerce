import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/api";
import Loader from "../../components/Loader";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(300); // 5 minutes
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{6,}$/;

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value) error = "Email requis";
        else if (!emailRegex.test(value)) error = "Email invalide";
        break;
      case "newPassword":
        if (!value) error = "Mot de passe requis";
        else if (!passwordRegex.test(value)) error = "Minimum 6 caractères";
        break;
      case "confirmNewPassword":
        if (!value) error = "Confirmation requise";
        else if (value !== newPassword)
          error = "Les mots de passe ne correspondent pas";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!validateField("email", email)) {
      toast.error("Veuillez entrer un email valide");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password/request", { email });
      setStep(2);
      setTimer(300);
      toast.success("Code OTP envoyé à votre email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la demande");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (
      !validateField("newPassword", newPassword) ||
      !validateField("confirmNewPassword", confirmNewPassword)
    ) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }
    if (!otp || otp.length !== 6) {
      toast.error("Veuillez entrer un code OTP valide (6 chiffres)");
      return;
    }
    if (timer === 0) {
      toast.error("Le code OTP a expiré");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password/confirm", {
        email,
        resetPassword: otp, // Nom du champ conforme à votre API
        motDePasse: newPassword, // Changement pour correspondre au backend
      });
      toast.success("Mot de passe réinitialisé avec succès");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la réinitialisation"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen bg-gray-50"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <Link to="/login" className="text-rose-600 mb-4 inline-block">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-semibold text-rose-700 mb-6 flex items-center gap-2">
          <Lock size={32} /> Réinitialisation du mot de passe
        </h1>
        {loading ? (
          <Loader />
        ) : step === 1 ? (
          <form onSubmit={handleRequest} className="space-y-6">
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateField("email", e.target.value);
                }}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre email"
                required
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 transition-colors"
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Demander un code"}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-6">
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Code OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez le code reçu"
                maxLength={6}
                required
                disabled={loading || timer === 0}
              />
              <p className="text-rose-600 text-sm mt-2">
                Temps restant : {formatTime(timer)}
                {timer === 0 && " (Code expiré)"}
              </p>
            </div>
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validateField("newPassword", e.target.value);
                }}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre nouveau mot de passe"
                required
                disabled={loading || timer === 0}
              />
              {errors.newPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  validateField("confirmNewPassword", e.target.value);
                }}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Confirmez votre mot de passe"
                required
                disabled={loading || timer === 0}
              />
              {errors.confirmNewPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirmNewPassword}
                </p>
              )}
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: loading || timer === 0 ? 1 : 1.05 }}
              whileTap={{ scale: loading || timer === 0 ? 1 : 0.95 }}
              className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 transition-colors"
              disabled={loading || timer === 0}
            >
              {loading ? "Réinitialisation en cours..." : "Réinitialiser"}
            </motion.button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;
