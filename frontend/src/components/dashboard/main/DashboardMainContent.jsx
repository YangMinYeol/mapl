import DashboardMainMemoItem from "./DashboardMainMemoItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck as faCircleCheckRegular } from "@fortawesome/free-regular-svg-icons";
import { useRef, useState, useContext } from "react";
import { addMemo, deleteMemo, toggleMemoCompletion } from "../../../api/memo";
import { LoginExpiredError } from "../../../util/error";
import { setDateByPeriod } from "../../../util/dateUtil";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../context/ModalContext";
import { UserContext } from "../../../context/UserContext";
import { useLoginExpiredHandler } from "../../../hooks/useLoginExpiredHandler";

export default function DashboardMainContent({
  memos,
  selectedPeriod,
  selectedDate,
  refreshMemoList,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const memoInputRef = useRef(null);
  const deepGreen = { color: "#173836" };
  const navigate = useNavigate();
  const [memoText, setMemoText] = useState("");
  const { openModal } = useModal();
  const { user } = useContext(UserContext);
  const handleLoginExpired = useLoginExpiredHandler();

  // 메모 추가
  function handleAddMemo() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (memoText.trim()) {
      addNewMemo();
    }
  }

  // 메모 추가
  async function addNewMemo() {
    try {
      const { startDate, endDate } = setDateByPeriod(
        selectedPeriod,
        selectedDate
      );
      await addMemo({
        userId: user.id,
        content: memoText,
        startDate,
        endDate,
        periodId: selectedPeriod.id,
      });
      await refreshMemoList();
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
  async function handleDeleteMemo(memoId) {
    try {
      await deleteMemo(memoId);
      await refreshMemoList();
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("메모 삭제 오류:", error);
        openModal(error.message);
      }
    }
  }

  // 메모 완료 상태 변경
  async function handleToggleMemoCompletion(memoId) {
    try {
      await toggleMemoCompletion(memoId);
      await refreshMemoList();
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
          {memos.map((memo) => {
            if (memo.periodId === selectedPeriod.id) {
              return (
                <li key={memo.id}>
                  <DashboardMainMemoItem
                    memo={memo}
                    onComplete={handleToggleMemoCompletion}
                    onDelete={handleDeleteMemo}
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
    </div>
  );
}
