import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Menu,
  X,
  Home,
  Package,
  Settings,
  User,
  BarChart2,
  LogOut,
  Layers,
  ShoppingBag,
  Bell,
  Percent,
  Star,
  FileText,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: BarChart2 },
    { label: "Produits", path: "/admin/products", icon: Package },
    { label: "Catégories", path: "/admin/categories", icon: Layers },
    { label: "Utilisateurs", path: "/admin/users", icon: User },
    { label: "Commandes", path: "/admin/orders", icon: ShoppingBag },
    { label: "Stocks", path: "/admin/stock", icon: Bell },
    { label: "Promotions", path: "/admin/promotions", icon: Percent },
    { label: "Avis", path: "/admin/reviews", icon: Star },
    { label: "Profil", path: "/admin/profile", icon: User },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout(user.email); // Ajout de l'email
      navigate("/login");
      toast.success("Déconnexion réussie");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la déconnexion");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarVariants = {
    open: { width: "16rem" },
    closed: { width: "4rem" },
    hidden: { x: "-100%" },
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <motion.aside
        initial={false}
        animate={
          window.innerWidth < 768
            ? isSidebarOpen
              ? "open"
              : "hidden"
            : isSidebarOpen
            ? "open"
            : "closed"
        }
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 bg-rose-700 text-white p-2 md:sticky md:h-screen shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-2xl font-bold truncate transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            CosmoPink
          </h2>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-rose-600"
            aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center gap-3 p-3 rounded-md hover:bg-rose-600 transition-colors w-full text-left ${
                location.pathname === item.path ? "bg-rose-600" : ""
              }`}
              title={item.label}
            >
              <item.icon size={20} />
              {isSidebarOpen && (
                <span
                  className={`transition-opacity duration-300 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  } whitespace-nowrap`}
                >
                  {item.label}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-md hover:bg-rose-600 transition-colors w-full text-left"
            title="Déconnexion"
          >
            <LogOut size={20} />
            <span
              className={`transition-opacity duration-300 ${
                isSidebarOpen ? "opacity-100" : "opacity-0"
              } whitespace-nowrap`}
            >
              Déconnexion
            </span>
          </button>
        </nav>
      </motion.aside>

      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 md:p-6 max-h-screen overflow-auto w-full">
        <div className="flex items-center justify-between mb-6 md:hidden">
          <h1 className="text-2xl font-semibold text-rose-700">
            Admin CosmoPink
          </h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-full hover:bg-rose-200"
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} className="text-rose-700" />
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
