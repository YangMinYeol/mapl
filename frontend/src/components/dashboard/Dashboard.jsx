import PeriodSelector from "./PeriodSelector";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import { useModal } from "../../context/ModalContext";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard({ selectedDate }) {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({});
  const [totalMemos, setTotalMemos] = useState(0);
  const [completedMemos, setCompletedMemos] = useState(0);
  const { openModal } = useModal();

  // 기한 목록 불러오기
  useEffect(() => {
    fetchPeriodType();
  }, []);

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

  function handleMemoCountUpdate(total, completed) {
    setTotalMemos(total);
    setCompletedMemos(completed);
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
        selectedDate={selectedDate}
        selectedPeriod={selectedPeriod}
        onMemoCounteUpdate={handleMemoCountUpdate}
      />
    </div>
  );
}
