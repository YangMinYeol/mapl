import PeriodSelector from "./PeriodSelector";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // 기한 목록 불러오기
  useEffect(() => {
    fetchPeriodType();
  }, []);

  // 선택된 날짜와 기간에 맞는 메모 목록 불러오기
  useEffect(() => {
    if (user && selectedDate) {
      loadMemoList();
    }
  }, [selectedDate, user]);

  useEffect(() => {
    if (selectedPeriod.id) {
      updateCount(memos);
    }
  }, [selectedPeriod, memos]);

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
  async function loadMemoList() {
    const message = "메모 목록을 불러오는데 실패하였습니다.";
    try {
      const memoData = await fetchMemos(user.id, selectedDate);
      const convertedMemos = convertArraySnakeToCamel(memoData);
      // 1. 메모 목록 정렬
      const sortedMemos = convertedMemos.sort(
        (a, b) => a.sortOrder - b.sortOrder
      );

      // 2. 메모 목록 업데이트
      setMemos(sortedMemos);

      // 3. 카운트 업데이트
      updateCount(convertedMemos);
    } catch (error) {
      console.error("메모 목록 불러오기 오류:", error);
      openModal(message);
    }
  }

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
      await loadMemoList();
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
      await loadMemoList();
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
      await loadMemoList();
    } catch (error) {
      console.error("메모 상태 변경 오류:", error);
      openModal(message);
    }
  }

  // 카운트 업데이트
  function updateCount(memoList) {
    const filteredMemos = memoList.filter(
      (memo) => memo.periodId === selectedPeriod.id
    );

    setTotalMemos(filteredMemos.length);
    setCompletedMemos(filteredMemos.filter((memo) => memo.completed).length);
  }

  // 기한 선택
  function handleSelectedPeriod(period) {
    setSelectedPeriod(period);
  }

  return (
    <div className="w-full h-full">
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        handleSelectedPeriod={handleSelectedPeriod}
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
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
