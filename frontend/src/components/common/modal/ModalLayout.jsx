import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId } from "react";
import Modal from "react-modal";
import Loading from "../Loading";

export default function ModalLayout({
  title,
  notice = false,
  headingIcon,
  className = "",
  onClose,
  isOpen,
  content,
  footer,
  isLoading = false,
  loadingLabel = "처리 중",
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      appElement={document.getElementById("root")}
      onRequestClose={onClose}
      shouldCloseOnEsc={!isLoading}
      aria={{ labelledby: titleId, describedby: notice && content ? descriptionId : undefined }}
      overlayClassName={notice ? "planner-record-overlay planner-notice-overlay" : "planner-record-overlay"}
      className={`planner-dialog planner-record-dialog${notice ? " planner-notice" : ""} ${className}`}
    >
      <div className="planner-dialog-frame" inert={isLoading ? "" : undefined} aria-busy={isLoading}>
        <div className="modal-header">
          <h2 className="planner-dialog-title" id={titleId}>
            {headingIcon && <span className="planner-heading-icon" aria-hidden="true"><FontAwesomeIcon icon={headingIcon} /></span>}
            {title}
          </h2>
          <button type="button" className="planner-dialog-close" aria-label="닫기" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
          </button>
        </div>
        {content && <div className="modal-content" id={notice ? descriptionId : undefined}>{content}</div>}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
      {isLoading && <Loading placement="surface" label={loadingLabel} />}
    </Modal>
  );
}
