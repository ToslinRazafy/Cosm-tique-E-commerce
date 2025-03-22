import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Filter, ChevronDown, List, Grid } from "lucide-react";
import { toast } from "react-toastify";
import Product from "../../components/Product";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { IMG_URL_BACKEND } from "../../constant";

const Shop = () => {
  const {
    products,
    fetchProducts,
    loading: productsLoading,
    error: productsError,
  } = useProducts();
  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [sortBy, setSortBy] = useState("price-asc");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const productsPerPage = 9;

  useEffect(() => {
    if (products.length > 0 && priceRange[1] === 0) {
      const maxPrice = Math.max(...products.map((p) => p.prix));
      setPriceRange([0, maxPrice]);
    }
  }, [products]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products
    .filter((product) => {
      if (search && !product.nom.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (
        selectedCategory &&
        !categories
          .find((cat) => cat.id === selectedCategory)
          ?.produits.some((p) => p.id === product.id)
      ) {
        return false;
      }
      if (product.prix < priceRange[0] || product.prix > priceRange[1]) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.prix - b.prix;
      if (sortBy === "price-desc") return b.prix - a.prix;
      return 0;
    });

  const paginatedProducts = filteredProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  useEffect(() => {
    if (productsError) toast.error(productsError);
    if (categoriesError) toast.error(categoriesError);
  }, [productsError, categoriesError]);

  const categoryList = [{ id: null, nom: "Toutes" }, ...categories];
  const maxPrice =
    products.length > 0 ? Math.max(...products.map((p) => p.prix)) : 0;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="container mx-auto h-screen flex flex-col">
      {/* Entête fixe */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <h1 className="text-3xl font-semibold text-rose-700">
          Boutique CosmoPink
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center gap-2 bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700"
          >
            <Filter size={20} /> Filtres
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid" ? "bg-rose-600 text-white" : "bg-rose-100"
              } rounded-md`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list" ? "bg-rose-600 text-white" : "bg-rose-100"
              } rounded-md`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal avec filtres fixes et produits scrollables */}
      <div className="flex flex-col md:flex-row gap-8 flex-grow overflow-hidden">
        {/* Filtres fixes */}
        <motion.aside
          className={`bg-white rounded-lg shadow-md p-6 md:w-1/4 flex-shrink-0 ${
            isFilterOpen ? "block" : "hidden md:block"
          }`}
        >
          <h2 className="text-xl font-semibold text-rose-700 mb-4">Filtres</h2>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Rechercher"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-rose-400 border p-2 rounded-lg outline-0 w-full"
            />
          </div>
          <div className="mb-6">
            <h3 className="text-rose-600 font-medium mb-2">Catégories</h3>
            <ul className="flex flex-col gap-2">
              {categoryList.map((category) => (
                <li key={category.id || "toutes"}>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left py-1 px-2 rounded-md ${
                      selectedCategory === category.id
                        ? "bg-rose-100 text-rose-700"
                        : "text-rose-600 hover:bg-rose-50"
                    }`}
                  >
                    {category.nom}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-rose-600 font-medium mb-2">Prix</h3>
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              className="w-full accent-rose-600"
            />
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-full accent-rose-600"
            />
            <div className="flex justify-between text-rose-600 mt-2">
              <span>{priceRange[0]} Ar</span>
              <span>{priceRange[1]} Ar</span>
            </div>
          </div>
          <div>
            <h3 className="text-rose-600 font-medium mb-2">Trier par</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-rose-300 rounded-md"
            >
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
        </motion.aside>

        {/* Section scrollable des produits */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="md:w-3/4 flex-grow overflow-y-auto"
        >
          {productsLoading || categoriesLoading ? (
            <p className="text-rose-600 text-center">Chargement...</p>
          ) : paginatedProducts.length === 0 ? (
            <p className="text-rose-600 text-center">Aucun produit trouvé.</p>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {paginatedProducts.map((product) => (
                <Product
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
          <div className="flex justify-center gap-4 mt-8 flex-shrink-0">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className="bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 disabled:bg-rose-300"
            >
              Précédent
            </button>
            <span className="text-rose-700 font-medium">
              Page {currentPage + 1} sur{" "}
              {Math.ceil(filteredProducts.length / productsPerPage) || 1}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={
                (currentPage + 1) * productsPerPage >= filteredProducts.length
              }
              className="bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 disabled:bg-rose-300"
            >
              Suivant
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Shop;
