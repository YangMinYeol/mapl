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
  const currentId = selectedLinkMemo?.id;
  const displayedMemos = [
    ...linkedMemos.filter((memo) => memo.id === currentId),
    ...linkedMemos.filter((memo) => memo.id !== currentId),
  ];
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
      title="연결된 메모 목록" className="planner-link-dialog" isOpen={isOpen} onClose={onClose} isLoading={isLoading}
      content={<>
        <div className="planner-link-summary">
          <span>선택한 메모</span>
          <strong>{selectedLinkMemo?.content}</strong>
        </div>
        <div className="planner-link-list" tabIndex={0} role="region" aria-label="연결된 메모">
          {linkedMemos.length === 0 && !isLoading && <p className="planner-link-empty">연결된 메모가 없어요.</p>}
          <ul>
            {displayedMemos.map((memo) => (
              <li key={memo.id} className={memo.id === currentId ? "planner-link-current" : undefined}>
                <LinkMemoItem memo={memo} isCurrent={memo.id === currentId} isOriginal={memo.id === linkId} />
              </li>
            ))}
          </ul>
        </div>
      </>}
      footer={<div className="record-actions">
        {selectedLinkMemo && selectedLinkMemo.id !== selectedLinkMemo.link && (
          <button type="button" className="record-delete" disabled={isLoading} onClick={handleUnlinkMemo}>현재 메모 링크 해제</button>
        )}
        <button type="button" className="record-cancel" onClick={onClose}>닫기</button>
      </div>}
    />
  );
}
