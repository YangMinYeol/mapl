import { useModal } from "../../context/ModalContext";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import ModalLayout from "./modal/ModalLayout";

export default function AlertModal() {
  const {
    modalOpen,
    modalMessage,
    subMessage,
    modalType,
    closeModal,
    onYes,
    onNo,
    confirmLabels,
  } = useModal();

  const handleError = useErrorHandler();
  const isConfirm = modalType === "confirm";
  const showChoices = isConfirm && confirmLabels;
  async function confirm(callback) {
    closeModal();
    try {
      await callback?.();
    } catch (error) {
      handleError(error);
    }
  }

  return (
    <ModalLayout
      notice
      isOpen={modalOpen}
      onClose={closeModal}
      title={isConfirm ? "확인" : "알림"}
      headingIcon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {isConfirm ? <path d="m5 12 4 4 10-9" /> : (
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5m0-8.4v.2" />
            </>
          )}
        </svg>
      }
      content={
        <div className="planner-notice-message">
          <p>{modalMessage}</p>
          {subMessage && <p className="planner-notice-description">{subMessage}</p>}
        </div>
      }
      footer={<div className="record-actions planner-notice-actions">
        {showChoices && (
          <>
            <button type="button" className="mapl-button mapl-button-outline" onClick={closeModal}>취소</button>
            <button type="button" className="mapl-button mapl-button-outline" onClick={() => confirm(onNo)}>{confirmLabels.no}</button>
          </>
        )}
        <button
          type="button"
          className="mapl-button"
          onClick={isConfirm ? () => confirm(onYes) : closeModal}
        >
          {showChoices ? confirmLabels.yes : isConfirm ? "예" : "확인"}
        </button>
        {isConfirm && !showChoices && (
          <button type="button" className="mapl-button mapl-button-outline" onClick={() => confirm(onNo)}>아니오</button>
        )}
      </div>
      }
    />
  );
}
