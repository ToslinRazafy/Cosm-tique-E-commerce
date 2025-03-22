import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      toast.error("Email invalide");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    try {
      const userData = await login(email, password);
      if (userData.role === "CLIENT") {
        navigate("/home");
        toast.success("Connexion réussie ! Bienvenue.");
      } else if (userData.role === "ADMIN") {
        navigate("/admin/dashboard");
        toast.success("Connexion réussie ! Bienvenue, Admin.");
      }
    } catch (err) {
      // Erreur déjà gérée dans useAuth via toast
    }
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
          <Lock size={32} /> Connexion
        </h1>
        {loading ? (
          <Loader />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-rose-600 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre email"
                required
                disabled={loading}
              />
            </div>
            <div className="relative">
              <label className="block text-rose-600 font-medium mb-2">
                Mot de passe
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre mot de passe"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-11 text-rose-600 hover:text-rose-700"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="text-right text-rose-600 text-sm">
              <Link to="/reset-password" className="hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 transition-colors"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </motion.button>
          </form>
        )}
        <div className="mt-4 text-center text-rose-600 text-sm">
          Pas de compte ?{" "}
          <Link to="/register" className="font-semibold hover:underline">
            Inscrivez-vous
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
