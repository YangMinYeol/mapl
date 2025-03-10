import Modal from "react-modal";
import { useEffect } from "react";
import { useModal } from "../../context/ModalContext";

export default function AlertModal() {
  const { modalOpen, modalMessage, closeModal } = useModal();

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
    <Modal isOpen={modalOpen} onRequestClose={closeModal} style={customStyle}>
      <div className="p-6 text-base font-semibold text-mapl-black">
        <span>{modalMessage}</span>
      </div>
      <div>
        <button
          onClick={closeModal}
          className="w-full p-3 font-semibold text-center border-t cursor-pointer border-mapl-slate text-deep-green"
        >
          확인
        </button>
      </div>
    </Modal>
  );
}
