import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { memoEmptyMessages } from "../memoEmptyMessages";
import {
  addMemo,
  deleteLinkedMemos,
  deleteMemo,
  postponeMemo,
  toggleLinkedMemosCompletion,
  toggleMemoCompletion,
} from "../../../../api/memo";
import { LINKED_MEMO } from "../../../../constants/messages";
import { useModal } from "../../../../context/ModalContext";
import { UserContext } from "../../../../context/UserContext";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";
import {
  postponeDates,
  setDateByPeriod,
} from "../../../../util/dateUtil";
import {
  MEMO_MODAL_MODE,
  canPostponeMemo,
  dailyMemoObjectToArray,
  separateDailyAndRangeMemos,
  sortMemos,
} from "../../../../util/memoUtil";
import MemoModal from "../../../memo/MemoModal";
import MainMemoItem from "./MainMemoItem";

export default function MainMemoContent({
  dashboardDatas,
  selectedPeriod,
  selectedDate,
  loadDashboardDatas,
  loadCalendarDatas,
  openLinkModal,
  onEdit,
}) {
  const navigate = useNavigate();
  const [memoText, setMemoText] = useState("");
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const quickSavePending = useRef(false);
  const { openConfirm } = useModal();
  const { user } = useContext(UserContext);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const handleError = useErrorHandler();

  // 메모 정렬
  function sortDashboardMemos(memos) {
    const { dailyMemos, rangeMemos } = separateDailyAndRangeMemos(memos);
    const sortedDaily = sortMemos(dailyMemoObjectToArray(dailyMemos), true);
    const sortedRange = sortMemos(rangeMemos, false);

    return [...sortedRange, ...sortedDaily];
  }

  // 메모 추가
  function handleAddMemo() {
    if (quickSavePending.current) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (memoText.trim()) {
      addNewMemo();
    } else {
      setIsMemoModalOpen(true);
    }
  }

  // 빠른 메모 추가
  async function addNewMemo() {
    quickSavePending.current = true;
    setIsQuickSaving(true);
    try {
      const { startDate, endDate } = setDateByPeriod(
        selectedPeriod,
        selectedDate
      );
      await addMemo([
        {
          userId: user.id,
          content: memoText,
          startDate,
          endDate,
          periodId: selectedPeriod.id,
          isLinked: false,
        },
      ]);
      await Promise.all([loadDashboardDatas(), loadCalendarDatas()]);
      setMemoText("");
    } catch (error) {
      handleError(error);
    } finally {
      quickSavePending.current = false;
      setIsQuickSaving(false);
    }
  }

  // 메모 삭제
  async function handleDeleteMemo(memo) {
    try {
      if (memo.isLinked) {
        openConfirm(
          LINKED_MEMO.TITLE,
          "연결된 메모를 모두 삭제할까요?",
          async () => {
            await deleteLinkedMemos(memo.link);
            await loadDashboardDatas();
            await loadCalendarDatas();
          }
        );
      } else {
        await deleteMemo(memo.id);
        await loadDashboardDatas();
        await loadCalendarDatas();
      }
    } catch (error) {
      handleError(error);
    }
  }

  // 메모 미루기,연장하기
  async function handlePostponeMemo(memo) {
    if (!canPostponeMemo(memo, selectedPeriod.name)) return;
    try {
      const { newStartDate, newEndDate } = postponeDates(
        selectedPeriod,
        memo.startDate
      );

      await postponeMemo(memo.id, newStartDate, newEndDate);
      await loadDashboardDatas();
      await loadCalendarDatas();
    } catch (error) {
      handleError(error);
    }
  }

  // 메모 완료 상태 변경
  async function handleToggleMemoCompletion(memo) {
    try {
      if (memo.isLinked) {
        openConfirm(
          LINKED_MEMO.TITLE,
          memo.completed ? "연결된 메모의 완료를 취소할까요?" : "연결된 메모를 모두 완료할까요?",
          async () => {
            await toggleLinkedMemosCompletion(memo.link);
            await loadDashboardDatas();
          }
        );
      } else {
        await toggleMemoCompletion(memo.id);
        await loadDashboardDatas();
      }
    } catch (error) {
      handleError(error);
    }
  }

  // Enter키 눌렀을때 메모 추가
  function handleKeyPress(e) {
    if (e.key === "Enter" && !e.repeat && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      handleAddMemo();
    }
  }

  // 입력값 변경 시 상태 업데이트
  function handleMemoChange(e) {
    setMemoText(e.target.value);
  }

  const visibleMemos = selectedPeriod.name === "Day"
    ? sortDashboardMemos(dashboardDatas)
    : dashboardDatas;

  return (
    <div className="h-[480px] border-b border-mapl-slate">
      <div className="overflow-auto h-11/12 dashboard-main-content">
        {visibleMemos.length === 0 ? (
          <p className="memo-empty">{memoEmptyMessages[selectedPeriod.name]}</p>
        ) : <ul>
          {visibleMemos.map((memo) => (
            <li key={memo.id}>
              <MainMemoItem
                memo={memo}
                onComplete={handleToggleMemoCompletion}
                onDelete={handleDeleteMemo}
                onEdit={onEdit}
                onPostpone={handlePostponeMemo}
                openLinkModal={openLinkModal}
                selectedPeriod={selectedPeriod}
              />
            </li>
          ))}
        </ul>}
      </div>
      <div className="flex items-center p-2 h-1/12 dashboard-content-add">
        <input
          className="px-1 border rounded outline-none border-mapl-black w-15/16"
          aria-label="빠른 메모"
          placeholder="메모 입력"
          value={memoText}
          onChange={handleMemoChange}
          onKeyDown={handleKeyPress}
          readOnly={isQuickSaving}
          maxLength={100}
        />
        <button
          type="button"
          className="planner-action"
          onClick={handleAddMemo}
          disabled={isQuickSaving}
        >
          {isQuickSaving ? "저장 중" : memoText.trim() ? "저장" : "추가"}
        </button>
      </div>
      <MemoModal
        isOpen={isMemoModalOpen}
        onClose={() => setIsMemoModalOpen(false)}
        selectedDate={selectedDate}
        mode={MEMO_MODAL_MODE.CREATE}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
