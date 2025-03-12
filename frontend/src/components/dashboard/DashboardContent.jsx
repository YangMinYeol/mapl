import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MemoItem from "./MemoItem";
import { faCirclePlus, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck as faCircleCheckRegular } from "@fortawesome/free-regular-svg-icons";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function DashboardContent({ selectedDate }) {
  const [memoText, setMemoText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [memos, setMemos] = useState([]);
  const { openModal } = useModal();
  const memoInputRef = useRef(null);
  const deepGreen = { color: "#173836" };
  const { user } = useContext(UserContext);

  // 선택된 날짜에 대한 목록 불러오기
  useEffect(() => {
    if (user && selectedDate) {
      getMemo();
    }
  }, [selectedDate, user]);

  // 메모 목록 불러오기
  async function getMemo() {
    try {
      const response = await fetch(
        `${API_URL}/api/memo/get?userId=${user.id}&startDate=${selectedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("메모 목록을 불러오는데 실패하였습니다.");
      }

      const data = await response.json();
      setMemos(data);
    } catch (error) {
      console.error("메모 목록 불러오기 오류:", error);
      openModal("메모 목록을 불러오는데 실패하였습니다.");
    }
  }

  // 메모 추가
  function handleAddMemo() {
    // 로딩 시작
    if (memoText.trim()) {
      addMemo();
    } else {
    }
    // 로딩 끝
  }

  // 메모 추가
  async function addMemo() {
    try {
      // 1. 메모 추가
      const response = await fetch(`${API_URL}/api/memo/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          content: memoText,
          startDate: selectedDate,
        }),
      });
      if (!response.ok) {
        throw new Error("메모 추가에 실패하였습니다.");
      }
      // 2. 메모 목록 불러오기
      await getMemo();

      // 3. 입력란 초기화
      setMemoText("");
    } catch (error) {
      console.error("메모 추가 오류:", error);
      openModal("메모 추가에 실패하였습니다.");
    }
  }

  // Enter키 눌렀을때 메모 추가
  function handleKeyUp(e) {
    if (e.key === "Enter" && memoInputRef.current === document.activeElement) {
      handleAddMemo();
    }
  }

  // 입력값 변경 시 상태 업데이트
  const handleMemoChange = useCallback((e) => {
    setMemoText(e.target.value); // 상태 업데이트
  }, []);

  // 마우스가 버튼 위에 있을 때 아이콘 변경
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // 아이콘 상태에 따른 동적 변경
  const getIcon = () => {
    if (memoText.trim() && isHovered) {
      return faCircleCheck;
    }
    return memoText.trim() ? faCircleCheckRegular : faCirclePlus;
  };

  return (
    <div className="h-full">
      <div className="border-b border-mapl-slate h-3/5">
        <div className="overflow-auto h-11/12 dashboard-content">
          <ul>
            {memos.map((memo) => (
              <MemoItem key={memo.id} text={memo.content} />
            ))}
          </ul>
        </div>
        <div className="flex items-center p-2 h-1/12 dashboard-content-add">
          <input
            className="px-1 border rounded outline-none border-mapl-black w-15/16"
            ref={memoInputRef}
            value={memoText}
            onChange={handleMemoChange}
            onKeyUp={handleKeyUp}
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
