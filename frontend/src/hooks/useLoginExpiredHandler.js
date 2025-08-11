import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";

export function useLoginExpiredHandler() {
  const { logout } = useContext(UserContext);
  const { openModal } = useModal();
  const navigate = useNavigate();

  const handleLoginExpired = (message) => {
    openModal(message, () => {
      logout();
      navigate("/login");
    });
  };

  return handleLoginExpired;
}
