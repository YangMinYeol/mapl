import Modal from "react-modal";
import { baseModalStyle } from "../../styles/modalStyle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { fetchLinkedMemos, unlinkMemo } from "../../api/memo";
import { useModal } from "../../context/ModalContext";
import Loading from "../common/Loading";
import LinkMemoItem from "./LinkMemoItem";
import { sortMemos } from "../../util/memoUtil";

export default function LinkModal({
  isOpen,
  onClose,
  selectedLinkMemo,
  loadDashboardMemos,
  loadCalendarMemos,
}) {
  const [linkedMemos, setLinkedMemos] = useState([]);
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  useEffect(() => {
    if (isOpen && selectedLinkMemo) {
      fetchLinkedMemo();
    }
  }, [isOpen]);

  function closeModal() {
    onClose();
  }

  async function fetchLinkedMemo() {
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

  // 링크 해제
  async function handleUnlinkMemo() {
    try {
      const { id, link } = selectedLinkMemo;
      setIsLoading(true);
      await unlinkMemo(id, link);
      loadDashboardMemos();
      loadCalendarMemos();
      closeModal();
    } catch (error) {
      console.error("메모 링크 해제 오류:", error);
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
      <div className="w-[350px]">
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
          <div className="p-1 my-2 border rounded border-mapl-slate">
            {selectedLinkMemo && selectedLinkMemo.content}
          </div>
          <div className="flex-col h-48 overflow-auto border rounded border-mapl-slate ">
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
        <div className="flex justify-between px-3 mt-4 mb-2">
          <div>
            {selectedLinkMemo &&
              selectedLinkMemo.id !== selectedLinkMemo.link && (
                <button
                  className="h-8 px-3 font-semibold text-white border rounded cursor-pointer bg-deep-green"
                  onClick={handleUnlinkMemo}
                >
                  현재 메모 링크 해제
                </button>
              )}
          </div>
          <div>
            <button
              className="h-8 px-3 font-semibold border rounded cursor-pointer"
              onClick={closeModal}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
      {isLoading && <Loading />}
    </Modal>
  );
}
