import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import { ModalProvider } from "./context/ModalContext"; // ModalProvider 임포트
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainPage from "./pages/MainPage";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AlertModal from "./components/common/AlertModal";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ModalProvider>
        <BrowserRouter>
          <AppContent />
          <AlertModal />
        </BrowserRouter>
      </ModalProvider>
    </UserContext.Provider>
  );
}
