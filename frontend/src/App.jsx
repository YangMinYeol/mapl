import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainPage from "./pages/MainPage";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useState } from "react";
import AlertModal from "./components/common/AlertModal";

function AppContent({ modalProps }) {
  const location = useLocation();

  const hideHeaderFooterRoutes = ["/login", "/signup"];
  const hideHeaderFooter = hideHeaderFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col app-container">
      {!hideHeaderFooter && <Header />}
      <div className="flex-1 content">
        <Routes>
          <Route path="/" element={<MainPage {...modalProps} />} />
          <Route path="/login" element={<LoginPage {...modalProps} />} />
          <Route path="/signup" element={<SignupPage {...modalProps} />} />
        </Routes>
      </div>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 모달 관련 props를 묶어 전달
  const modalProps = {
    setModalOpen,
    setModalMessage,
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <AppContent modalProps={modalProps} />
        <AlertModal
          isOpen={modalOpen}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
        />
      </BrowserRouter>
    </UserContext.Provider>
  );
}
