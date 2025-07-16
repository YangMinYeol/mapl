import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AlertModal from "./components/common/AlertModal";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { ColorProvider } from "./context/ColorContext";
import { ModalProvider } from "./context/ModalContext";
import { UserContext } from "./context/UserContext";
import BoardPage from "./pages/BoardPage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import SignupPage from "./pages/SignupPage";
import UserPage from "./pages/UserPage";
import useAssetStore from "./stores/useAssetStore";
import useCategoryStore from "./stores/useCategoryStore";

function AppContent() {
  const location = useLocation();

  const hideHeaderFooterRoutes = ["/login", "/signup"];
  const hideHeaderFooter = hideHeaderFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col app-container">
      {!hideHeaderFooter && <Header />}
      <div className="flex-1 content">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/user/*" element={<UserPage />} />
        </Routes>
      </div>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const resetCategories = useCategoryStore((state) => state.resetCategories);

  const updateAsset = useAssetStore((state) => state.updateAsset);
  const resetAsset = useAssetStore((state) => state.resetAsset);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      fetchCategories(user.id);
      updateAsset(user.id);
    } else {
      localStorage.removeItem("user");
      resetCategories();
      resetAsset();
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ModalProvider>
        <ColorProvider>
          <BrowserRouter>
            <AppContent />
            <AlertModal />
          </BrowserRouter>
        </ColorProvider>
      </ModalProvider>
    </UserContext.Provider>
  );
}
