import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CartFavoritesProvider } from "../context/CartFavoritesContext";

const UserLayout = () => {
  return (
    <CartFavoritesProvider>
      <div className="flex flex-col min-h-screen bg-rose-50/30 scroll-smooth">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12 lg:px-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartFavoritesProvider>
  );
};

export default UserLayout;
