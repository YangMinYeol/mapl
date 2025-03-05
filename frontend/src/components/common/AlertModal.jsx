import Modal from "react-modal";
import { useEffect } from "react";

export default function AlertModal({ isOpen, message, onClose }) {
  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);
  const customStyle = {
    overlay: {
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    content: {
      padding: 0,
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      borderRadius: "10px",
    },
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyle}>
      <div className="p-6 text-base font-semibold text-mapl-black">
        <span>{message}</span>
      </div>
      <div>
        <button
          onClick={onClose}
          className="w-full p-3 font-semibold text-center border-t cursor-pointer border-mapl-slate text-deep-green"
        >
          확인
        </button>
      </div>
    </Modal>
  );
}
