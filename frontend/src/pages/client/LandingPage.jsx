import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronRight,
  Menu,
  X,
  Home,
  Users,
  Package,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useProducts } from "../../hooks/useProducts";
import Loader from "../../components/Loader";
import { IMG_URL_BACKEND } from "../../constant";
import api from "../../api/api";

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const heroImages = ["/hero.webp", "/her2.jpg", "/hero3.jpg"];

const LandingPage = () => {
  const { products, fetchProducts, loading, error } = useProducts();
  const [currentHero, setCurrentHero] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [contactForm, setContactForm] = useState({
    subject: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    fetchProducts(false);
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  useEffect(() => {
    if (products && Array.isArray(products)) {
      const shuffled = shuffleArray(products);
      setDisplayedProducts(shuffled.slice(0, 6));
    } else {
      setDisplayedProducts([]);
    }
  }, [products]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const scaleHover = {
    whileHover: { scale: 1.05, transition: { duration: 0.3 } },
    whileTap: { scale: 0.95 },
  };

  const navItems = [
    { label: "Accueil", href: "#home", icon: Home },
    { label: "À Propos", href: "#aboutus", icon: Users },
    { label: "Produits", href: "#products", icon: Package },
    { label: "Contact", href: "#contactus", icon: Mail },
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.email || !contactForm.message) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const email = contactForm.email;
    const subject = contactForm.subject;
    const message = contactForm.message;

    await api.post("/client/contact", { email, subject, message });
    toast.success("Message envoyé avec succès !");
    setContactForm({ subject: "", email: "", message: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen scroll-smooth">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg py-4 px-6 flex justify-between items-center"
      >
        <Link to="/" className="text-2xl font-bold tracking-wider">
          CosmoPink
        </Link>
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 text-white hover:text-rose-200 transition-colors font-medium text-lg"
              {...scaleHover}
            >
              <item.icon size={20} />
              {item.label}
            </motion.a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="bg-white text-rose-600 px-4 py-2 rounded-full hover:bg-rose-100 transition-colors font-semibold"
          >
            Connexion
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-0 right-0 bg-rose-600 p-4 md:hidden"
            >
              {navItems.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 py-2 text-white hover:text-rose-200 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon size={20} />
                  {item.label}
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <motion.section
        id="home"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        <AnimatePresence>
          <motion.img
            key={currentHero}
            src={heroImages[currentHero]}
            alt="Héro Cosmétique"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full object-cover brightness-50"
          />
        </AnimatePresence>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            Sublimez Votre Beauté
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
          >
            Des cosmétiques naturels et futuristes pour un éclat intemporel.
          </motion.p>
          <motion.div variants={fadeIn}>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-rose-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-rose-700 transition-colors text-lg"
              {...scaleHover}
            >
              <ShoppingBag size={24} />
              Explorer la Boutique
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="aboutus"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
        className="container mx-auto px-4 py-20"
      >
        <motion.h2
          variants={fadeIn}
          className="text-4xl md:text-5xl font-semibold text-rose-700 mb-12 text-center flex items-center justify-center gap-2"
        >
          <Users size={36} className="text-rose-600" /> À Propos de Nous
        </motion.h2>
        <motion.p
          variants={fadeIn}
          className="text-lg text-rose-600 max-w-3xl mx-auto text-center mb-8"
        >
          Chez CosmoPink, nous croyons en une beauté qui transcende le temps.
          Nos produits allient innovation, nature et design pour offrir une
          expérience unique à chaque cliente.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Vision",
              desc: "Réinventer la beauté avec des solutions durables.",
            },
            {
              title: "Mission",
              desc: "Sublimer chaque peau avec soin et élégance.",
            },
            {
              title: "Valeurs",
              desc: "Qualité, innovation et respect de la nature.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              {...scaleHover}
            >
              <h3 className="text-xl font-medium text-rose-600 mb-4">
                {item.title}
              </h3>
              <p className="text-rose-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="products"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
        className="bg-gradient-to-r from-rose-100 to-pink-100 py-20"
      >
        <motion.h2
          variants={fadeIn}
          className="text-4xl md:text-5xl font-semibold text-rose-700 mb-12 text-center flex items-center justify-center gap-2"
        >
          <Package size={36} className="text-rose-600" />
          Nos Produits
        </motion.h2>
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {loading ? (
            <Loader className="col-span-full" />
          ) : error ? (
            <p className="text-rose-600 text-center col-span-full">{error}</p>
          ) : displayedProducts.length === 0 ? (
            <p className="text-rose-600 text-center col-span-full">
              Aucun produit disponible
            </p>
          ) : (
            displayedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeIn}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                {...scaleHover}
              >
                <img
                  src={
                    product.imagePath
                      ? `${IMG_URL_BACKEND}${product.imagePath}`
                      : "/img.jpg"
                  }
                  alt={product.nom}
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.target.src = "/img.jpg")}
                />
                <div className="p-4">
                  <h3 className="text-lg font-medium text-rose-700">
                    {product.nom}
                  </h3>
                  <p className="text-rose-600 font-semibold">
                    {product.prix.toFixed(2)} MGA
                  </p>
                  <Link
                    to={`/product/${product.id}`}
                    className="mt-2 inline-block text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                  >
                    Découvrir <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
        <motion.div variants={fadeIn} className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-rose-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-rose-700 transition-colors text-lg"
            {...scaleHover}
          >
            Voir tous les produits
          </Link>
        </motion.div>
      </motion.section>

      <motion.section
        id="contactus"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
        className="container mx-auto px-4 py-20 bg-rose-50"
      >
        <motion.h2
          variants={fadeIn}
          className="text-4xl md:text-5xl font-semibold text-rose-700 mb-12 text-center flex items-center justify-center gap-2"
        >
          <Mail size={36} className="text-rose-600" />
          Contactez-nous
        </motion.h2>
        <motion.p
          variants={fadeIn}
          className="text-lg text-rose-600 max-w-2xl mx-auto text-center mb-12"
        >
          Une question ou une suggestion ? Remplissez le formulaire ci-dessous
          et nous vous répondrons dans les plus brefs délais.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div variants={fadeIn}>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-rose-600 font-medium mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  placeholder="votre.email@example.com"
                  className="w-full p-3 border border-rose-300 rounded-md text-rose-600 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-rose-600 font-medium mb-2"
                >
                  Objet
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  placeholder="Votre nom"
                  className="w-full p-3 border border-rose-300 rounded-md text-rose-600 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-rose-600 font-medium mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  placeholder="Votre message..."
                  rows="5"
                  className="w-full p-3 border border-rose-300 rounded-md text-rose-600 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>
              <motion.button
                type="submit"
                className="w-full bg-rose-600 text-white py-3 rounded-md font-semibold hover:bg-rose-700 transition-colors"
                {...scaleHover}
              >
                Envoyer le Message
              </motion.button>
            </form>
          </motion.div>
          <motion.div variants={fadeIn} className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-medium text-rose-700 mb-4">
                Informations de Contact
              </h3>
              <p className="text-rose-600">
                <strong>Email :</strong> razafitosy@gmail.com
              </p>
              <p className="text-rose-600">
                <strong>Téléphone :</strong> +261 38 05 253 83
              </p>
              <p className="text-rose-600">
                <strong>Adresse :</strong> Ampitakely,FIANARANTSOA
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-medium text-rose-700 mb-4">
                Horaires
              </h3>
              <p className="text-rose-600">Lundi - Vendredi : 9h00 - 18h00</p>
              <p className="text-rose-600">Samedi : 10h00 - 14h00</p>
              <p className="text-rose-600">Dimanche : Fermé</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.footer
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-gradient-to-r from-rose-600 to-pink-600 text-white py-8"
      >
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">
            © {new Date().getFullYear()} CosmoPink. Tous droits réservés.
          </p>
          <div className="flex justify-center gap-6">
            {navItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-white hover:text-rose-200 transition-colors"
                {...scaleHover}
              >
                {item.label}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;