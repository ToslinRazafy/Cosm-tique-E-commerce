import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import LandingPage from "./pages/client/LandingPage";
import UserLayout from "./layout/UserLayout";
import AdminLayout from "./layout/AdminLayout";
import Home from "./pages/client/Home";
import Shop from "./pages/client/Shop";
import ProductDetailPage from "./pages/client/ProductDetailPage";
import CartPage from "./pages/client/CartPage";
import FavoritesPage from "./pages/client/FavoritesPage";
import OrderHistoryPage from "./pages/client/OrderHistoryPage";
import ProfilePage from "./pages/client/ProfilePage";
import SettingsPage from "./pages/client/SettingsPage";
import CheckoutPage from "./pages/client/CheckoutPage";
import NewArrivalsPage from "./pages/client/NewArrivalsPage";
import PromotionsPage from "./pages/client/PromotionsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminStock from "./pages/admin/AdminStock";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminReviews from "./pages/admin/AdminReviews";
import { ToastContainer } from "react-toastify";

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>; // Afficher un écran de chargement pendant la vérification
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "CLIENT" ? "/home" : "/admin/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
};

const ProtectedRouteUnlock = () => {
  const { user } = useAuth();

  if(user.blocked){
    return <Navigate to={"/settings"} replace/>
  }

  return <Outlet/>
}

const App = () => {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Routes publiques */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={<LandingPage />} />

        {/* Routes pour les utilisateurs connectés (CLIENT) */}
        <Route element={<UserLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedRouteUnlock />}>
              <Route path="/home" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/new-arrivals" element={<NewArrivalsPage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Routes pour les administrateurs */}
        <Route element={<AdminLayout />}>
          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/stock" element={<AdminStock />} />
            <Route path="/admin/promotions" element={<AdminPromotions />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
          </Route>
        </Route>

        {/* Redirection par défaut basée sur le rôle */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate
                to={user.role === "CLIENT" ? "/home" : "/admin/dashboard"}
                replace
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default App;
