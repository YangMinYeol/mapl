import Modal from "react-modal";
import { useEffect } from "react";
import { useModal } from "../../context/ModalContext";

export default function AlertModal() {
  const {
    modalOpen,
    modalMessage,
    subMessage,
    modalType,
    closeModal,
    onYes,
    onNo,
  } = useModal();

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
      minWidth: "150px",
    },
  };

  return (
    <Modal isOpen={modalOpen} onRequestClose={closeModal} style={customStyle}>
      <div className="p-6 text-mapl-black">
        <div className="text-base font-semibold">
          <span>{modalMessage}</span>
        </div>
        {subMessage && (
          <div className="pt-3 text-sm">
            <span>{subMessage}</span>
          </div>
        )}
      </div>
      <div>
        {modalType === "alert" ? (
          <button
            onClick={closeModal}
            className="w-full p-3 font-semibold text-center border-t cursor-pointer border-mapl-slate text-deep-green"
          >
            확인
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                if (onYes) onYes();
                closeModal();
              }}
              className="w-1/2 p-3 font-semibold text-center border-t border-r cursor-pointer border-mapl-slate text-deep-green"
            >
              예
            </button>
            <button
              onClick={() => {
                if (onNo) onNo();
                closeModal();
              }}
              className="w-1/2 p-3 font-semibold text-center border-t cursor-pointer border-mapl-slate text-deep-green"
            >
              아니오
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
