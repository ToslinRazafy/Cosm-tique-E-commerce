import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const navigation = [
    { label: "Accueil", href: "/home" },
    { label: "Boutique", href: "/shop" },
    { label: "Nouveautés", href: "/new-arrivals" },
    { label: "Promotions", href: "/promotions" },
    { label: "À Propos", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Conditions", href: "/terms" },
    { label: "Confidentialité", href: "/privacy" },
  ];

  return (
    <footer className="bg-rose-600 text-white py-8 md:py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">CosmoPink</h3>
          <p className="text-rose-100 text-sm">Votre beauté, notre passion.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Navigation</h4>
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.label}>
                <motion.a
                  whileHover={{ x: 5 }}
                  onClick={() => navigate(item.href)}
                  className="text-rose-100 hover:text-white text-sm cursor-pointer"
                >
                  {item.label}
                </motion.a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Support</h4>
          <p className="text-rose-100 text-sm">Email: support@cosmopink.com</p>
          <p className="text-rose-100 text-sm">Tél: +33 1 23 45 67 89</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
          <div className="flex gap-4">
            <a href="#" className="text-rose-100 hover:text-white">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-rose-100 hover:text-white">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-rose-100 hover:text-white">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-6 md:mt-8 text-center text-rose-200 text-sm">
        © {new Date().getFullYear()} CosmoPink. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
