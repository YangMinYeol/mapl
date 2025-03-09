import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  function openModal(message) {
    setModalMessage(message);
    setModalOpen(true);
  }

  return (
    <ModalContext.Provider
      value={{ modalOpen, modalMessage, setModalOpen, openModal }}
    >
      {children}
    </ModalContext.Provider>
  );
}
