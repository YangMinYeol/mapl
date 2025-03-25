import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useModal } from "../context/ModalContext";

export function useLoginExpiredHandler() {
  const { setUser } = useContext(UserContext);
  const { openModal } = useModal();
  const navigate = useNavigate();

  const handleLoginExpired = (message) => {
    openModal(message, () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    });
  };

  return handleLoginExpired;
}
