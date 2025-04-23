import { useEffect, useState } from "react";
import PeriodSelector from "./PeriodSelector";
import DashboardMain from "./main/DashboardMain";
import DashboardSub from "./sub/DashboardSub";

export default function Dashboard({
  dashboardMemos,
  loadDashboardMemos,
  loadCalendarMemos,
  selectedDate,
  periods,
  selectedPeriod,
  handleSelectedPeriod,
}) {
  const [totalMemos, setTotalMemos] = useState(0);
  const [completedMemos, setCompletedMemos] = useState(0);

  useEffect(() => {
    if (selectedPeriod.id) {
      updateCount(dashboardMemos);
    }
  }, [selectedPeriod, dashboardMemos]);

  // 카운트 업데이트
  function updateCount(memoList) {
    const filteredMemos = memoList.filter(
      (memo) => memo.periodId === selectedPeriod.id
    );

    setTotalMemos(filteredMemos.length);
    setCompletedMemos(filteredMemos.filter((memo) => memo.completed).length);
  }

  return (
    <div className="h-full">
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        handleSelectedPeriod={handleSelectedPeriod}
      />
      <DashboardMain
        dashboardMemos={dashboardMemos}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        totalMemos={totalMemos}
        completedMemos={completedMemos}
        loadDashboardMemos={loadDashboardMemos}
        loadCalendarMemos={loadCalendarMemos}
      />
      <DashboardSub
        dashboardMemos={dashboardMemos}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        loadDashboardMemos={loadDashboardMemos}
      />
    </div>
  );
}
