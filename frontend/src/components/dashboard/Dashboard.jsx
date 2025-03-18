import PeriodSelector from "./PeriodSelector";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { useState, useEffect, useContext } from "react";
import { setDateByPeriod } from "../../util/dateUtil";
import { convertArraySnakeToCamel } from "../../util/caseConverter";
import {
  fetchMemos,
  addMemo,
  deleteMemo,
  toggleMemoCompletion,
} from "../../api/memo";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard({ selectedDate }) {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({});
  const [totalMemos, setTotalMemos] = useState(0);
  const [memos, setMemos] = useState([]);
  const [memoText, setMemoText] = useState("");
  const [completedMemos, setCompletedMemos] = useState(0);
  const { openModal } = useModal();
  const { user } = useContext(UserContext);

  // 기한 목록 불러오기
  useEffect(() => {
    fetchPeriodType();
  }, []);

  // 선택된 날짜에 대한 목록 불러오기
  useEffect(() => {
    if (user && selectedDate) {
      fetchMemoList();
    }
  }, [selectedDate, user]);

  // 기한 목록 불러오기
  async function fetchPeriodType() {
    const message = "기한 목록을 불러오는데 실패하였습니다.";
    try {
      const response = await fetch(`${API_URL}/api/period`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(message);
      }
      const data = await response.json();
      setPeriods(data);
      setSelectedPeriod(data[0]);
    } catch (error) {
      console.error("기한 목록 불러오기 오류:", error);
      openModal(message);
    }
  }

  // 메모 목록 불러오기
  async function fetchMemoList() {
    const message = "메모 목록을 불러오는데 실패하였습니다.";
    try {
      const data = await fetchMemos(user.id, selectedDate);
      const convertedData = convertArraySnakeToCamel(data);
      const sortedData = convertedData.sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      setMemos(sortedData);

      // completed/total 업데이트
      const total = data.length;
      const completed = data.filter((memo) => memo.completed).length;
      setTotalMemos(total);
      setCompletedMemos(completed);
    } catch (error) {
      console.error("메모 목록 불러오기 오류:", error);
      openModal(message);
    }
  }

  // 메모 추가
  function handleAddMemo() {
    if (memoText.trim()) {
      addNewMemo();
    }
  }

  async function addNewMemo() {
    const message = "메모 추가에 실패하였습니다.";
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
      await fetchMemoList();
      setMemoText("");
    } catch (error) {
      console.error("메모 추가 오류:", error);
      openModal(message);
    }
  }

  // 메모 삭제
  async function handleDeleteMemo(memoId) {
    const message = "메모 삭제에 실패하였습니다.";
    try {
      await deleteMemo(memoId);
      await fetchMemoList();
    } catch (error) {
      console.error("메모 삭제 오류:", error);
      openModal(message);
    }
  }

  // 메모 완료 상태 변경
  async function handleToggleMemoCompletion(memoId) {
    const message = "메모 상태 변경에 실패하였습니다.";
    try {
      await toggleMemoCompletion(memoId);
      await fetchMemoList();
    } catch (error) {
      console.error("메모 상태 변경 오류:", error);
      openModal(message);
    }
  }

  return (
    <div className="w-full h-full">
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      <DashboardHeader
        selectedDate={selectedDate}
        selectedPeriod={selectedPeriod}
        totalMemos={totalMemos}
        completedMemos={completedMemos}
      />
      <DashboardContent
        memos={memos}
        memoText={memoText}
        setMemoText={setMemoText}
        handleAddMemo={handleAddMemo}
        handleDeleteMemo={handleDeleteMemo}
        handleToggleMemoCompletion={handleToggleMemoCompletion}
      />
    </div>
  );
}
