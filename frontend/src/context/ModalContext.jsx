import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [subMessage, setSubMessage] = useState("");
  const [modalType, setModalType] = useState("alert"); //alert  | confirm
  const [onClose, setOnClose] = useState(null);
  const [onYes, setOnYes] = useState(null);
  const [onNo, setOnNo] = useState(null);

  function openModal(message, onCloseCallback = null, subMessage = "") {
    setModalMessage(message);
    setSubMessage(subMessage);
    setModalType("alert");
    setModalOpen(true);
    setOnClose(() => onCloseCallback);
  }

  function openConfirm(message, subMessage = "", onYesCallback, onNoCallback) {
    setModalMessage(message);
    setSubMessage(subMessage);
    setModalType("confirm");
    setModalOpen(true);
    setOnYes(() => onYesCallback);
    setOnNo(() => onNoCallback);
  }

  function closeModal() {
    if (onClose) {
      onClose();
    }
    setModalOpen(false);
  }

  return (
    <ModalContext.Provider
      value={{
        modalOpen,
        modalMessage,
        subMessage,
        modalType,
        setModalOpen,
        openModal,
        openConfirm,
        closeModal,
        onYes,
        onNo,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
