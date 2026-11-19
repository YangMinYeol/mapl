import { faRectangleList } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";
import { baseModalStyle } from "../../../styles/modalStyle";
import Loading from "../Loading";

export default function ModalLayout({
  title,
  record = false,
  onClose,
  isOpen,
  handleModalClick = () => {},
  content,
  footer,
  isLoading,
}) {
  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      contentLabel={title}
      appElement={document.getElementById("root")}
      onRequestClose={isLoading ? undefined : onClose}
      style={record ? undefined : baseModalStyle}
      overlayClassName={record ? "planner-record-overlay" : undefined}
      className={record ? "planner-dialog planner-record-dialog" : "planner-dialog"}
    >
      <div className="planner-dialog-frame" inert={isLoading ? "" : undefined} aria-busy={isLoading} onClick={handleModalClick}>
        {/* Header */}
        <div className="h-[46px] border-b modal-header border-mapl-slate flex justify-between items-center px-3">
          <div className="text-base">
            <h2 className="planner-dialog-title">{!record && <FontAwesomeIcon icon={faRectangleList} />}{title}</h2>
          </div>
          <div>
            <button
              className="planner-dialog-close" aria-label="닫기"
              onClick={onClose}
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="group-hover:text-green-900"
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content flex-col px-3">
          {content}
        </div>

        {/* Footer */}
        <div className="modal-footer border-mapl-slate px-3 flex items-center">
          {footer}
        </div>
      </div>
      {isLoading && <Loading />}
    </Modal>
  );
}
