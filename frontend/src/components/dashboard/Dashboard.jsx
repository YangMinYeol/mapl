import PeriodSelector from "./PeriodSelector";
import DashboardMain from "./main/DashboardMain";
import DashboardSub from "./sub/DashboardSub";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { useState, useEffect, useContext } from "react";
import { convertArraySnakeToCamel } from "../../util/caseConverter";
import { fetchMemos } from "../../api/memo";
import { LoginExpiredError } from "../../util/error";
import { useLoginExpiredHandler } from "../../hooks/useLoginExpiredHandler";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard({ selectedDate }) {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({});
  const [totalMemos, setTotalMemos] = useState(0);
  const [memos, setMemos] = useState([]);
  const [completedMemos, setCompletedMemos] = useState(0);
  const { openModal } = useModal();
  const { user } = useContext(UserContext);
  const handleLoginExpired = useLoginExpiredHandler();

  // 기한 목록 불러오기
  useEffect(() => {
    fetchPeriodType();
  }, []);

  // 선택된 날짜와 기간에 맞는 메모 목록 불러오기
  useEffect(() => {
    if (user && selectedDate) {
      refreshMemoList();
    }
  }, [selectedDate, user]);

  useEffect(() => {
    if (selectedPeriod.id) {
      updateCount(memos);
    }
  }, [selectedPeriod, memos]);

  // 기한 목록 불러오기
  async function fetchPeriodType() {
    try {
      const response = await fetch(`${API_URL}/api/period`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setPeriods(data);
      setSelectedPeriod(data[0]);
    } catch (error) {
      console.error("기한 목록 불러오기 오류:", error);
      openModal(error.message);
    }
  }

  // 메모 목록 새로고침
  async function refreshMemoList() {
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
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("메모 목록 불러오기 오류:", error);
        openModal(error.message);
      }
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
    <div className="h-full">
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        handleSelectedPeriod={handleSelectedPeriod}
      />
      <DashboardMain
        memos={memos}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        totalMemos={totalMemos}
        completedMemos={completedMemos}
        refreshMemoList={refreshMemoList}
      />
      <DashboardSub
        memos={memos}
        periods={periods}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
