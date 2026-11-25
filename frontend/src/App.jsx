import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { clearRefreshCookie, resetAuthRequests, SESSION_EXPIRED_EVENT } from "./api/auth";
import AlertModal from "./components/common/AlertModal";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { ColorProvider } from "./context/ColorContext";
import { ModalProvider, useModal } from "./context/ModalContext";
import { UserContext } from "./context/UserContext";
import BoardPage from "./pages/BoardPage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import SignupPage from "./pages/SignupPage";
import UserPage from "./pages/UserPage";
import { useErrorHandler } from "./hooks/useErrorHandler";
import useAssetStore from "./stores/useAssetStore";
import useCategoryStore from "./stores/useCategoryStore";

function AppContent({ expired }) {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const handleError = useErrorHandler();
  const errorHandler = useRef(handleError);
  useEffect(() => { errorHandler.current = handleError; }, [handleError]);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const resetCategories = useCategoryStore((state) => state.resetCategories);

  const updateAsset = useAssetStore((state) => state.updateAsset);
  const resetAsset = useAssetStore((state) => state.resetAsset);

  useEffect(() => {
    let current = true;
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      Promise.all([fetchCategories(user.id), updateAsset(user.id)]).catch((error) => {
        if (current) errorHandler.current(error);
      });
    } else {
      localStorage.removeItem("user");
      resetCategories();
      resetAsset();
    }
    return () => { current = false; };
  }, [user, fetchCategories, resetCategories, updateAsset, resetAsset]);

  const hideHeaderFooterRoutes = ["/login", "/signup"];
  const hideHeaderFooter = hideHeaderFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col app-container" inert={expired ? "" : undefined}>
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

function SessionContent() {
  const { user, logout } = useContext(UserContext);
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!user || expired) return;
    function onSessionExpired() {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      setExpired(true);
      openModal("로그인이 만료됐어요.", () => {
        logout();
        navigate("/login", { replace: true });
      }, "계속 이용하려면 다시 로그인해 주세요.");
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [user, expired, logout, navigate, openModal]);

  return (
    <ColorProvider>
      <AppContent expired={expired} />
      <AlertModal />
    </ColorProvider>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // 로그아웃
  const logout = useCallback(() => {
    resetAuthRequests();
    useCategoryStore.getState().resetCategories();
    useAssetStore.getState().resetAsset();
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setUser(null);
    void clearRefreshCookie();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      <BrowserRouter>
        <ModalProvider key={user?.id ?? "guest"}>
          <SessionContent />
        </ModalProvider>
      </BrowserRouter>
    </UserContext.Provider>
  );
}
