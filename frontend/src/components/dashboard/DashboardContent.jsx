import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MemoItem from "./MemoItem";
import { faCirclePlus, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck as faCircleCheckRegular } from "@fortawesome/free-regular-svg-icons";
import { useCallback, useRef, useState } from "react";

export default function DashboardContent({
  memos,
  memoText,
  setMemoText,
  handleAddMemo,
  handleDeleteMemo,
  handleToggleMemoCompletion,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const memoInputRef = useRef(null);
  const deepGreen = { color: "#173836" };

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
    <div className="h-full">
      <div className="border-b border-mapl-slate h-3/5">
        <div className="overflow-auto h-11/12 dashboard-content">
          <ul>
            {memos.map((memo) => (
              <li key={memo.id}>
                <MemoItem
                  memo={memo}
                  onComplete={handleToggleMemoCompletion}
                  onDelete={handleDeleteMemo}
                />
              </li>
            ))}
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
      <div className="dashboard-source h-1/5"></div>
    </div>
  );
}
