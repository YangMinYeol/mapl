import MemoModal from "../../memo/MemoModal";
import DashboardMainMemoItem from "./DashboardMainMemoItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck as faCircleCheckRegular } from "@fortawesome/free-regular-svg-icons";
import { useRef, useState, useContext } from "react";
import {
  addMemo,
  deleteMemo,
  toggleMemoCompletion,
  toggleLinkedMemosCompletion,
  deleteLinkedMemos,
} from "../../../api/memo";
import { LoginExpiredError } from "../../../util/error";
import { setDateByPeriod } from "../../../util/dateUtil";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../context/ModalContext";
import { UserContext } from "../../../context/UserContext";
import { useLoginExpiredHandler } from "../../../hooks/useLoginExpiredHandler";
import {
  dailyMemoObjectToArray,
  separateDailyAndRangeMemos,
  sortMemos,
} from "../../../util/memoUtil";

export default function DashboardMainContent({
  dashboardMemos,
  selectedPeriod,
  selectedDate,
  loadDashboardMemos,
  loadCalendarMemos,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const memoInputRef = useRef(null);
  const deepGreen = { color: "#173836" };
  const navigate = useNavigate();
  const [memoText, setMemoText] = useState("");
  const { openModal, openConfirm } = useModal();
  const { user } = useContext(UserContext);
  const handleLoginExpired = useLoginExpiredHandler();
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [memoModalMode, setMemoModalMode] = useState("");
  const [selectedMemo, setSelectedMemo] = useState(null);

  // 메모 정렬
  function sortDashboardMemos(memos) {
    const { dailyMemos, rangeMemos } = separateDailyAndRangeMemos(memos);
    const sortedDaily = sortMemos(dailyMemoObjectToArray(dailyMemos), true);
    const sortedRange = sortMemos(rangeMemos, false);

    return [...sortedRange, ...sortedDaily];
  }

  // 메모 추가
  function handleAddMemo() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (memoText.trim()) {
      addNewMemo();
    } else {
      setMemoModalMode("create");
      setIsMemoModalOpen(true);
    }
  }

  // 빠른 메모 추가
  async function addNewMemo() {
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
      await loadDashboardMemos();
      await loadCalendarMemos();
      setMemoText("");
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("메모 추가 오류:", error);
        openModal(error.message);
      }
    }
  }

  // 메모 삭제
  async function handleDeleteMemo(memo) {
    try {
      if (memo.isLinked) {
        openConfirm(
          "링크되어있는 메모입니다.",
          "동기화되어있는 메모 모두 삭제하시겠습니까?",
          async () => {
            await deleteLinkedMemos(memo.link);
            await loadDashboardMemos();
            await loadCalendarMemos();
          }
        );
      } else {
        await deleteMemo(memo.id);
        await loadDashboardMemos();
        await loadCalendarMemos();
      }
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("메모 삭제 오류:", error);
        openModal(error.message);
      }
    }
  }

  // 메모 편집 모달
  function openEditMemoModal(memo) {
    if (memo.isLinked) {
      openConfirm(
        "링크되어있는 메모입니다.",
        "동기화되어있는 메모 모두 내용이 함께 변경됩니다.",
        async () => {
          setSelectedMemo(memo);
          setMemoModalMode("edit");
          setIsMemoModalOpen(true);
        }
      );
    } else {
      setSelectedMemo(memo);
      setMemoModalMode("edit");
      setIsMemoModalOpen(true);
    }
  }

  // 메모 완료 상태 변경
  async function handleToggleMemoCompletion(memo) {
    try {
      if (memo.isLinked) {
        openConfirm(
          "링크되어있는 메모입니다.",
          "동기화되어있는 메모 모두 complete 하시겠습니까?",
          async () => {
            await toggleLinkedMemosCompletion(memo.link);
            await loadDashboardMemos();
          }
        );
      } else {
        await toggleMemoCompletion(memo.id);
        await loadDashboardMemos();
      }
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("메모 상태 변경 오류:", error);
        openModal(error.message);
      }
    }
  }

  // Enter키 눌렀을때 메모 추가
  function handleKeyPress(e) {
    if (e.key === "Enter") {
      handleAddMemo();
    }
  }

  // 입력값 변경 시 상태 업데이트
  function handleMemoChange(e) {
    setMemoText(e.target.value);
  }

  // 마우스가 버튼 위에 있을 때 아이콘 변경
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // 아이콘 상태에 따른 동적 변경
  const getIcon = () => {
    const isFilled = memoText.trim().length > 0;
    return isFilled
      ? isHovered
        ? faCircleCheck
        : faCircleCheckRegular
      : faCirclePlus;
  };

  return (
    <div className="h-[480px] border-b border-mapl-slate">
      <div className="overflow-auto h-11/12 dashboard-main-content">
        <ul>
          {(selectedPeriod.id === 1
            ? sortDashboardMemos(dashboardMemos)
            : dashboardMemos
          ).map((memo) => {
            if (memo.periodId === selectedPeriod.id) {
              return (
                <li key={memo.id}>
                  <DashboardMainMemoItem
                    memo={memo}
                    onComplete={handleToggleMemoCompletion}
                    onDelete={handleDeleteMemo}
                    onEdit={openEditMemoModal}
                  />
                </li>
              );
            }
          })}
        </ul>
      </div>
      <div className="flex items-center p-2 h-1/12 dashboard-content-add">
        <input
          className="px-1 border rounded outline-none border-mapl-black w-15/16"
          ref={memoInputRef}
          value={memoText}
          onChange={handleMemoChange}
          onKeyUp={handleKeyPress}
          maxLength={100}
        />
        <button
          className="cursor-pointer w-1/16"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleAddMemo}
        >
          <FontAwesomeIcon style={deepGreen} icon={getIcon()} size="xl" />
        </button>
      </div>
      <MemoModal
        isOpen={isMemoModalOpen}
        onClose={() => {
          setIsMemoModalOpen(false);
          setSelectedMemo(null);
        }}
        selectedDate={selectedDate}
        mode={memoModalMode}
        memo={selectedMemo}
        loadDashboardMemos={loadDashboardMemos}
        loadCalendarMemos={loadCalendarMemos}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
