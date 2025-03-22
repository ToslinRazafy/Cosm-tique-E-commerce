import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Filter, Plus, Edit, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import Loader from "../../components/Loader";
import { IMG_URL_BACKEND } from "../../constant";

const AdminProducts = () => {
  const {
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
  } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    nom: "",
    description: "",
    prix: "",
    prixOriginal: "",
    stock: "",
    seuilStockBas: "",
    categorie: "",
    marque: "",
    ingredients: "",
    dateExpiration: "",
    image: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts(true); // Mode admin
    fetchCategories(true); // Mode admin
  }, [fetchProducts, fetchCategories]);

  const validateProduct = useCallback((product) => {
    const errors = {};
    if (!product.nom || product.nom.trim().length < 2)
      errors.nom = "Nom requis (min 2 caractères)";
    if (!product.prix || isNaN(product.prix) || product.prix <= 0)
      errors.prix = "Prix invalide";
    if (!product.stock || isNaN(product.stock) || product.stock < 0)
      errors.stock = "Stock invalide";
    if (
      !product.seuilStockBas ||
      isNaN(product.seuilStockBas) ||
      product.seuilStockBas < 0
    )
      errors.seuilStockBas = "Seuil stock bas invalide";
    if (!product.categorie) errors.categorie = "Catégorie requise";
    return errors;
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredProducts = safeProducts
    .filter((product) =>
      product.nom.toLowerCase().includes(search.toLowerCase())
    )
    .filter((product) =>
      filterCategory
        ? safeCategories
            .find((cat) => cat.id === parseInt(filterCategory))
            ?.produits.some((p) => p.id === product.id) || false
        : true
    );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleImageChange = (e, setState) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setState((prev) => ({ ...prev, image: file }));
    } else {
      toast.error("Veuillez sélectionner une image valide");
    }
  };

  const handleAddProduct = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateProduct(newProduct);
      if (Object.keys(errors).length) {
        Object.values(errors).forEach((error) => toast.error(error));
        return;
      }
      setActionLoading(true);
      try {
        await createProduct(
          {
            nom: newProduct.nom,
            description: newProduct.description || null,
            prix: parseFloat(newProduct.prix),
            prixOriginal: 0,
            stock: parseInt(newProduct.stock, 10),
            seuilStockBas: parseInt(newProduct.seuilStockBas, 10),
            categorie: { id: parseInt(newProduct.categorie, 10) },
            marque: newProduct.marque || null,
            ingredients: newProduct.ingredients || null,
            dateExpiration: newProduct.dateExpiration || null,
          },
          newProduct.image
        );
        setNewProduct({
          nom: "",
          description: "",
          prix: "",
          prixOriginal: "",
          stock: "",
          seuilStockBas: "",
          categorie: "",
          marque: "",
          ingredients: "",
          dateExpiration: "",
          image: null,
        });
        setIsAddModalOpen(false);
        toast.success("Produit ajouté avec succès");
        // Refresh products and categories after adding
        await fetchProducts(true);
        await fetchCategories(true);
      } catch (err) {
        toast.error("Erreur lors de l'ajout du produit");
      } finally {
        setActionLoading(false);
      }
    },
    [createProduct, newProduct, validateProduct, fetchProducts, fetchCategories]
  );

  const handleEditProduct = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateProduct(selectedProduct);
      if (Object.keys(errors).length) {
        Object.values(errors).forEach((error) => toast.error(error));
        return;
      }
      setActionLoading(true);
      try {
        await updateProduct(
          selectedProduct.id,
          {
            nom: selectedProduct.nom,
            description: selectedProduct.description || null,
            prix: parseFloat(selectedProduct.prix),
            prixOriginal: 0,
            stock: parseInt(selectedProduct.stock, 10),
            seuilStockBas: parseInt(selectedProduct.seuilStockBas, 10),
            categorie: { id: parseInt(selectedProduct.categorie, 10) },
            marque: selectedProduct.marque || null,
            ingredients: selectedProduct.ingredients || null,
            dateExpiration: selectedProduct.dateExpiration || null,
          },
          selectedProduct.image instanceof File ? selectedProduct.image : null
        );
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        toast.success("Produit mis à jour avec succès");
        // Refresh products and categories after editing
        await fetchProducts(true);
        await fetchCategories(true);
      } catch (err) {
        toast.error("Erreur lors de la mise à jour du produit");
      } finally {
        setActionLoading(false);
      }
    },
    [
      updateProduct,
      selectedProduct,
      validateProduct,
      fetchProducts,
      fetchCategories,
    ]
  );

  const handleDeleteProduct = useCallback(async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    try {
      await deleteProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      toast.success("Produit supprimé avec succès");
      // Refresh products and categories after deleting
      await fetchProducts(true);
      await fetchCategories(true);
    } catch (err) {
      toast.error("Erreur lors de la suppression du produit");
    } finally {
      setActionLoading(false);
    }
  }, [deleteProduct, selectedProduct, fetchProducts, fetchCategories]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  if (loading) return <Loader />;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 bg-gray-50 min-h-screen"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-rose-700 flex items-center gap-2">
          <Package size={28} /> Gestion des Produits
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-600"
              size={20}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher des produits..."
              className="w-full pl-10 pr-4 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={20} className="text-rose-600" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent w-full sm:w-auto"
            >
              <option value="">Tous</option>
              {safeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-rose-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition-colors"
          >
            <Plus size={20} /> Ajouter
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        {filteredProducts.length === 0 ? (
          <p className="text-rose-600 text-center p-6">Aucun produit trouvé</p>
        ) : (
          <>
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-rose-50">
                <tr>
                  <th className="p-4 text-rose-700 font-semibold">Image</th>
                  <th className="p-4 text-rose-700 font-semibold">Nom</th>
                  <th className="p-4 text-rose-700 font-semibold">Prix</th>
                  <th className="p-4 text-rose-700 font-semibold">
                    Prix Original
                  </th>
                  <th className="p-4 text-rose-700 font-semibold">Stock</th>
                  <th className="p-4 text-rose-700 font-semibold">
                    Seuil Stock Bas
                  </th>
                  <th className="p-4 text-rose-700 font-semibold">Catégorie</th>
                  <th className="p-4 text-rose-700 font-semibold">Marque</th>
                  <th className="p-4 text-rose-700 font-semibold">
                    Ingredients
                  </th>
                  <th className="p-4 text-rose-700 font-semibold">
                    Description
                  </th>
                  <th className="p-4 text-rose-700 font-semibold">
                    Date d'expiration
                  </th>
                  <th className="p-4 text-rose-700 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-b hover:bg-rose-50 transition-colors ${
                      product.stock <= product.seuilStockBas
                        ? "bg-yellow-100"
                        : ""
                    }`}
                  >
                    <td className="p-4">
                      <img
                        src={
                          product.imagePath
                            ? `${IMG_URL_BACKEND}${product.imagePath}`
                            : "/img.jpg"
                        }
                        alt={product.nom}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </td>
                    <td className="p-4 text-rose-600">{product.nom}</td>
                    <td className="p-4 text-rose-600">
                      {product.prix.toFixed(2)} Ar
                    </td>
                    <td className="p-4 text-rose-600">
                      {product.prixOriginal.toFixed(2)} Ar
                    </td>
                    <td className="p-4 text-rose-600">{product.stock}</td>
                    <td className="p-4 text-rose-600">
                      {product.seuilStockBas}
                    </td>
                    <td className="p-4 text-rose-600">
                      {safeCategories.find((cat) =>
                        cat.produits.some((p) => p.id === product.id)
                      )?.nom || "N/A"}
                    </td>
                    <td className="p-4 text-rose-600">{product.marque}</td>
                    <td className="p-4 text-rose-600">{product.description}</td>
                    <td className="p-4 text-rose-600">{product.ingredients}</td>
                    <td className="p-4 text-rose-600">
                      {product.dateExpiration}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedProduct({
                            ...product,
                            categorie: product.categorie?.id || "",
                            prix: product.prix.toString(),
                            prixOriginal:
                              product.prixOriginal?.toString() || "",
                            stock: product.stock.toString(),
                            seuilStockBas: product.seuilStockBas.toString(),
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="text-rose-600 hover:text-rose-700"
                        disabled={actionLoading}
                      >
                        <Edit size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                        disabled={actionLoading}
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="p-4 flex justify-center items-center gap-4">
                <motion.button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 border border-rose-300 rounded-lg text-rose-600 disabled:opacity-50"
                >
                  Précédent
                </motion.button>
                <span className="text-rose-600 font-medium">
                  Page {currentPage} / {totalPages}
                </span>
                <motion.button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 border border-rose-300 rounded-lg text-rose-600 disabled:opacity-50"
                >
                  Suivant
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-rose-700">
                  Ajouter un Produit
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="flex justify-center">
                  <label className="relative cursor-pointer">
                    <img
                      src={
                        newProduct.image
                          ? URL.createObjectURL(newProduct.image)
                          : "/img.jpg"
                      }
                      alt="Produit"
                      className="w-24 h-24 object-cover rounded-md border-2 border-rose-300"
                    />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, setNewProduct)}
                      accept="image/*"
                      disabled={actionLoading}
                    />
                    <Plus
                      className="absolute bottom-0 right-0 text-rose-600 bg-white rounded-full p-1"
                      size={24}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={newProduct.nom}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, nom: e.target.value })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Prix *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.prix}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, prix: e.target.value })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Seuil Stock Bas *
                    </label>
                    <input
                      type="number"
                      value={newProduct.seuilStockBas}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          seuilStockBas: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Catégorie *
                    </label>
                    <select
                      value={newProduct.categorie}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          categorie: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    >
                      <option value="">Sélectionner</option>
                      {safeCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Marque
                    </label>
                    <input
                      type="text"
                      value={newProduct.marque}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, marque: e.target.value })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-rose-600 font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      rows="3"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-rose-600 font-medium mb-1">
                      Ingrédients
                    </label>
                    <textarea
                      value={newProduct.ingredients}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          ingredients: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      rows="3"
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Date d'Expiration
                    </label>
                    <input
                      type="date"
                      value={newProduct.dateExpiration}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          dateExpiration: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={actionLoading}
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Ajout en cours..." : "Ajouter"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && selectedProduct && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-rose-700">
                  Modifier le Produit
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEditProduct} className="space-y-4">
                <div className="flex justify-center">
                  <label className="relative cursor-pointer">
                    <img
                      src={
                        selectedProduct.image instanceof File
                          ? URL.createObjectURL(selectedProduct.image)
                          : selectedProduct.imagePath
                          ? `${IMG_URL_BACKEND}${selectedProduct.imagePath}`
                          : "/img.jpg"
                      }
                      alt="Produit"
                      className="w-24 h-24 object-cover rounded-md border-2 border-rose-300"
                    />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, setSelectedProduct)}
                      accept="image/*"
                      disabled={actionLoading}
                    />
                    <Plus
                      className="absolute bottom-0 right-0 text-rose-600 bg-white rounded-full p-1"
                      size={24}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.nom}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          nom: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Prix *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedProduct.prix}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          prix: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.stock}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          stock: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Seuil Stock Bas *
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.seuilStockBas}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          seuilStockBas: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Catégorie *
                    </label>
                    <select
                      value={selectedProduct.categorie}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          categorie: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                      disabled={actionLoading}
                    >
                      <option value="">Sélectionner</option>
                      {safeCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Marque
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.marque || ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          marque: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-rose-600 font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedProduct.description || ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      rows="3"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-rose-600 font-medium mb-1">
                      Ingrédients
                    </label>
                    <textarea
                      value={selectedProduct.ingredients || ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          ingredients: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      rows="3"
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 font-medium mb-1">
                      Date d'Expiration
                    </label>
                    <input
                      type="date"
                      value={selectedProduct.dateExpiration || ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          dateExpiration: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={actionLoading}
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Mise à jour..." : "Enregistrer"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && selectedProduct && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-rose-700">
                  Confirmer la Suppression
                </h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-rose-600 mb-6">
                Supprimer le produit "{selectedProduct.nom}" ?
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteProduct}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Suppression..." : "Oui"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-rose-100 text-rose-600 py-2 rounded-lg hover:bg-rose-200 transition-colors"
                  disabled={actionLoading}
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

export default AdminProducts;
