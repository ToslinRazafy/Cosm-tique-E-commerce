import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Select from "react-select";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(300);
  const { register, verifyOtp, loading } = useAuth();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[A-Za-z\s]+$/;
  const addressRegex = /^[A-Za-z0-9\s,.-]+$/;

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
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value) error = "L'email est requis";
        else if (!emailRegex.test(value)) error = "Email invalide";
        break;
      case "firstName":
      case "lastName":
        if (!value) error = `${name === "firstName" ? "Prénom" : "Nom"} requis`;
        else if (!nameRegex.test(value))
          error = "Lettres et espaces uniquement";
        break;
      case "password":
        if (!value) error = "Mot de passe requis";
        else if (value.length < 6) error = "Minimum 6 caractères";
        break;
      case "confirmPassword":
        if (!value) error = "Confirmation requise";
        else if (value !== password)
          error = "Les mots de passe ne correspondent pas";
        break;
      case "address":
        if (value && !addressRegex.test(value))
          error = "Caractères non autorisés";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (name) => (e) => {
    const value = e.target.value;
    if (name === "firstName") setFirstName(value);
    else if (name === "lastName") setLastName(value);
    else if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "confirmPassword") setConfirmPassword(value);
    else if (name === "address") setAddress(value);
    validateField(name, value);
  };

  const isFormValid = () =>
    firstName &&
    lastName &&
    email &&
    password &&
    confirmPassword &&
    Object.values(errors).every((error) => !error);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    try {
      await register({
        prenom: firstName, // Changement pour correspondre au backend
        nom: lastName, // Changement pour correspondre au backend
        email,
        motDePasse: password, // Changement pour correspondre au backend
        adresse: address || null, // Changement pour correspondre au backend
        pays: country || null, // Changement pour correspondre au backend
      });
      setStep(2);
      toast.success("Code OTP envoyé à votre email");
    } catch (err) {
      // Erreur déjà gérée dans useAuth via toast
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (timer === 0) {
      toast.error("Le code OTP a expiré");
      return;
    }
    if (!otp || otp.length !== 6) {
      toast.error("Veuillez entrer un code OTP valide (6 chiffres)");
      return;
    }
    try {
      await verifyOtp(email, otp, {
        prenom: firstName,
        nom: lastName,
        email,
        motDePasse: password,
        adresse: address || null,
        pays: country || null,
      });
      toast.success("Inscription réussie ! Bienvenue.");
      navigate("/home");
    } catch (err) {
      // Erreur déjà gérée dans useAuth via toast
    }
  };

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  const customOption = ({ innerProps, label, data }) => (
    <div
      {...innerProps}
      className="flex items-center gap-2 p-2 hover:bg-rose-100 cursor-pointer"
    >
      <img src={data.flag} alt={`Drapeau de ${label}`} className="w-5 h-3" />
      <span>{label}</span>
    </div>
  );

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#f43f5e",
      "&:hover": { borderColor: "#fb7185" },
      borderRadius: "0.5rem",
    }),
    menu: (provided) => ({
      ...provided,
      maxHeight: "150px",
      overflowY: "auto",
    }),
  };

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
        <h1 className="text-3xl font-semibold text-rose-700 mb-6 flex items-center gap-2">
          <User size={32} /> Inscription
        </h1>
        {loading ? (
          <Loader />
        ) : step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={handleChange("firstName")}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre prénom"
                required
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={handleChange("lastName")}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre nom"
                required
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleChange("email")}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre email"
                required
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={handleChange("password")}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre mot de passe"
                required
                disabled={loading}
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleChange("confirmPassword")}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Confirmez votre mot de passe"
                required
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Adresse (optionnel)
              </label>
              <input
                type="text"
                value={address}
                onChange={handleChange("address")}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre adresse"
                disabled={loading}
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Pays (optionnel)
              </label>
              <Select
                options={countries}
                value={countries.find((c) => c.value === country) || null}
                onChange={(selected) =>
                  setCountry(selected ? selected.value : "")
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
              whileHover={{ scale: loading || !isFormValid() ? 1 : 1.05 }}
              whileTap={{ scale: loading || !isFormValid() ? 1 : 0.95 }}
              className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 transition-colors"
              disabled={loading || !isFormValid()}
            >
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Code OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez le code reçu par email"
                maxLength={6}
                required
                disabled={loading || timer === 0}
              />
              <p className="text-rose-600 text-sm mt-2">
                Temps restant : {formatTime(timer)}
                {timer === 0 && " (Code expiré)"}
              </p>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: loading || timer === 0 ? 1 : 1.05 }}
              whileTap={{ scale: loading || timer === 0 ? 1 : 0.95 }}
              className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 transition-colors"
              disabled={loading || timer === 0}
            >
              {loading ? "Vérification en cours..." : "Vérifier"}
            </motion.button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default Register;
