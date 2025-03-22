import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useOrders } from "../../hooks/useOrders";
import { useProducts } from "../../hooks/useProducts";
import { useUsers } from "../../hooks/useUsers";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { orders, fetchOrders, loading: ordersLoading } = useOrders();
  const { products, fetchProducts, loading: productsLoading } = useProducts();
  const { users, fetchUsers, loading: usersLoading } = useUsers();
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchOrders(true); // Mode admin
    fetchProducts(true); // Mode admin
    fetchUsers();
  }, [fetchOrders, fetchProducts, fetchUsers]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const totalSales = safeOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );
  const pendingOrders = safeOrders.filter((o) => o.statut === "PENDING").length;
  const lowStockProducts = safeProducts.filter(
    (p) => (p.stock || 0) < (p.seuilStockBas || 5)
  ).length;

  const filterOrdersByPeriod = (orders, period) => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.dateCommande || Date.now());
      if (period === "week") return now - orderDate <= 7 * 24 * 60 * 60 * 1000;
      if (period === "month")
        return now - orderDate <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  };

  const filteredOrders = filterOrdersByPeriod(safeOrders, period);
  const salesChartData = {
    labels: filteredOrders
      .map((o) => new Date(o.dateCommande).toLocaleDateString())
      .reverse(),
    datasets: [
      {
        label: "Ventes",
        data: filteredOrders.map((o) => o.total || 0).reverse(),
        borderColor: "#e11d48",
        backgroundColor: "rgba(225, 29, 72, 0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Ventes (${
          period === "week" ? "Semaine" : period === "month" ? "Mois" : "Total"
        })`,
      },
    },
    scales: { y: { beginAtZero: true } },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  if (ordersLoading || productsLoading || usersLoading) return <Loader />;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-8 bg-gray-50 min-h-screen"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-rose-700 flex items-center gap-2">
          <BarChart2 size={32} /> Tableau de Bord
        </h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="p-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        >
          <option value="week">Dernière semaine</option>
          <option value="month">Dernier mois</option>
          <option value="all">Tout</option>
        </select>
      </div>

      <motion.div
        variants={staggerChildren}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div
          variants={fadeIn}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-lg font-semibold text-rose-700">
            Ventes Totales
          </h2>
          <p className="text-3xl text-rose-600 mt-2">
            {totalSales.toFixed(2)} Ar
          </p>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-lg font-semibold text-rose-700">
            Produits Actifs
          </h2>
          <p className="text-3xl text-rose-600 mt-2">{safeProducts.length}</p>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-lg font-semibold text-rose-700">
            Commandes en Attente
          </h2>
          <p className="text-3xl text-rose-600 mt-2">{pendingOrders}</p>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-lg font-semibold text-rose-700">Stocks Bas</h2>
          <p className="text-3xl text-rose-600 mt-2">{lowStockProducts}</p>
        </motion.div>
      </motion.div>

      <motion.div
        variants={fadeIn}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <Line data={salesChartData} options={chartOptions} />
      </motion.div>

      <motion.div
        variants={staggerChildren}
        className="bg-white rounded-xl shadow-lg overflow-x-auto"
      >
        <h2 className="text-lg font-semibold text-rose-700 p-4 bg-rose-50">
          Produits Populaires
        </h2>
        <table className="w-full text-left">
          <thead className="bg-rose-50">
            <tr>
              <th className="p-4 text-rose-700 font-semibold">Produit</th>
              <th className="p-4 text-rose-700 font-semibold">Stock</th>
              <th className="p-4 text-rose-700 font-semibold">Prix</th>
            </tr>
          </thead>
          <tbody>
            {safeProducts.slice(0, 5).map((product) => (
              <motion.tr
                key={product.id}
                variants={fadeIn}
                className="border-b hover:bg-rose-50 transition-colors"
              >
                <td className="p-4 text-rose-600">
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="hover:underline"
                  >
                    {product.nom || "N/A"}
                  </Link>
                </td>
                <td className="p-4 text-rose-600">{product.stock || 0}</td>
                <td className="p-4 text-rose-600">
                  {product.prix.toFixed(2)} Ar
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
