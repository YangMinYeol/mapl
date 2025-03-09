import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  return (
    <ModalContext.Provider
      value={{ modalOpen, setModalOpen, modalMessage, setModalMessage }}
    >
      {children}
    </ModalContext.Provider>
  );
}
