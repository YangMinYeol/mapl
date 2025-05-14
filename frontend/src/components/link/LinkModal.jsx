import Modal from "react-modal";
import { baseModalStyle } from "../../styles/modalStyle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { fetchLinkedMemos } from "../../api/memo";
import { useModal } from "../../context/ModalContext";
import Loading from "../common/Loading";
import LinkMemoItem from "./LinkMemoItem";
import { sortMemos } from "../../util/memoUtil";

export default function LinkModal({ isOpen, onClose, selectedLinkMemo }) {
  const [linkedMemos, setLinkedMemos] = useState(null);
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  useEffect(() => {
    if (isOpen && selectedLinkMemo) {
      fetchData();
    }
  }, [isOpen]);

  function closeModal() {
    onClose();
  }

  async function fetchData() {
    try {
      setIsLoading(true);
      const linkedMemos = await fetchLinkedMemos(selectedLinkMemo.link);
      const sortedLinkedMemos = sortMemos(linkedMemos, false);
      setLinkedMemos(sortedLinkedMemos);
    } catch (error) {
      console.error("링크된 메모 목록 불러오기 오류:", error);
      closeModal();
      openModal(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      style={baseModalStyle}
    >
      <div className="w-96">
        {/* Header */}
        <div className="h-[46px] border-b modal-header border-mapl-slate flex justify-between items-center px-3">
          <div className="text-base">
            <span>링크 연결된 메모 목록</span>
          </div>
          <div>
            <button
              className="w-7 h-7 hover:cursor-pointer group"
              onClick={closeModal}
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
        <div className="px-3 modal-content">
          <div className="p-1 my-1 border rounded border-mapl-slate">
            {selectedLinkMemo.content}
          </div>
          <div className="flex-col h-48 overflow-auto">
            <ul>
              {linkedMemos.map((memo) => {
                return (
                  <li key={memo.id}>
                    <LinkMemoItem memo={memo} />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div>
          <button
            onClick={closeModal}
            className="w-full p-3 font-semibold text-center border-t cursor-pointer border-mapl-slate text-deep-green"
          >
            확인
          </button>
        </div>
      </div>
      {isLoading && <Loading />}
    </Modal>
  );
}
