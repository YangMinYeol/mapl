import { useEffect, useState } from "react";
import ModalLayout from "../common/modal/ModalLayout";
import { fetchLinkedMemos, unlinkMemo } from "../../api/memo";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { sortMemos } from "../../util/memoUtil";
import LinkMemoItem from "./LinkMemoItem";

export default function LinkModal({
  isOpen,
  onClose,
  selectedLinkMemo,
  loadDashboardDatas,
  loadCalendarDatas,
}) {
  const [linkedMemos, setLinkedMemos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleError = useErrorHandler(onClose);

  const linkId = selectedLinkMemo?.link;
  useEffect(() => {
    if (!isOpen || linkId == null) return;
    let current = true;
    setIsLoading(true);
    fetchLinkedMemos(linkId)
      .then((items) => { if (current) setLinkedMemos(sortMemos(items, false)); })
      .catch((error) => { if (current) handleError(error, { closeCurrentModal: true }); })
      .finally(() => { if (current) setIsLoading(false); });
    return () => { current = false; };
  }, [isOpen, linkId]);

  // 링크 해제
  async function handleUnlinkMemo() {
    try {
      const { id, link } = selectedLinkMemo;
      setIsLoading(true);
      await unlinkMemo(id, link);
      await Promise.all([loadDashboardDatas(), loadCalendarDatas()]);
      onClose();
    } catch (error) {
      handleError(error, { closeCurrentModal: true });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ModalLayout
      record title="링크 연결된 메모 목록" isOpen={isOpen} onClose={onClose} isLoading={isLoading}
      content={<>
        <p className="mb-3">{selectedLinkMemo?.content}</p>
        <ul className="max-h-48 overflow-auto">
          {linkedMemos.map((memo) => <li key={memo.id}><LinkMemoItem memo={memo} /></li>)}
        </ul>
      </>}
      footer={<div className="record-actions">
        {selectedLinkMemo && selectedLinkMemo.id !== selectedLinkMemo.link && (
          <button className="record-delete" disabled={isLoading} onClick={handleUnlinkMemo}>현재 메모 링크 해제</button>
        )}
        <button className="record-cancel" onClick={onClose}>닫기</button>
      </div>}
    />
  );
}
