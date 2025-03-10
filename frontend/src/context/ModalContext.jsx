import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [onClose, setOnClose] = useState(null);

  function openModal(message, onCloseCallback = null) {
    setModalMessage(message);
    setModalOpen(true);
    setOnClose(() => onCloseCallback);
  }

  function closeModal() {
    if (onClose) {
      onClose();
    }
    setModalOpen(false);
  }

  return (
    <ModalContext.Provider
      value={{ modalOpen, modalMessage, setModalOpen, openModal, closeModal }}
    >
      {children}
    </ModalContext.Provider>
  );
}
