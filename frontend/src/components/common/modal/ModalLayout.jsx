import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";
import { baseModalStyle } from "../../../styles/modalStyle";
import Loading from "../Loading";

export default function ModalLayout({
  title,
  onClose,
  isOpen,
  modalSize,
  handleModalClick = () => {},
  content,
  footer,
  isLoading,
}) {
  const { width, height, contentHeight } = modalSize;
  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      style={baseModalStyle}
    >
      <div className={`${width} ${height}`} onClick={handleModalClick}>
        {/* Header */}
        <div className="h-[46px] border-b modal-header border-mapl-slate flex justify-between items-center px-3">
          <div className="text-base">
            <span>{title}</span>
          </div>
          <div>
            <button
              className="w-7 h-7 hover:cursor-pointer group"
              onClick={onClose}
            >
              <FontAwesomeIcon
                icon={faXmark}
                size="lg"
                className="group-hover:text-green-900"
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`${contentHeight} modal-content flex-col px-3`}>
          {content}
        </div>

        {/* Footer */}
        <div className="h-[46px] modal-footer border-mapl-slate px-3 flex items-center">
          {footer}
        </div>
      </div>
      {isLoading && <Loading />}
    </Modal>
  );
}
