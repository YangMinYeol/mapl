import { useEffect, useState } from "react";
import PeriodSelector from "./PeriodSelector";
import DashboardMain from "./main/DashboardMain";
import DashboardSub from "./sub/DashboardSub";
import LinkModal from "../link/LinkModal";

export default function Dashboard({
  dashboardMemos,
  loadDashboardMemos,
  loadCalendarMemos,
  selectedDate,
  periods,
  selectedPeriod,
  setSelectedPeriod,
}) {
  const [totalMemos, setTotalMemos] = useState(0);
  const [completedMemos, setCompletedMemos] = useState(0);

  // 링크 메모
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedLinkMemo, setSelectedLinkMemo] = useState(null);

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

  function openLinkModal(memo) {
    setSelectedLinkMemo(memo);
    setIsLinkModalOpen(true);
  }

  function closeLinkModal() {
    setIsLinkModalOpen(false);
  }

  return (
    <div className="h-full">
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
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
        openLinkModal={openLinkModal}
      />
      <DashboardSub
        dashboardMemos={dashboardMemos}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        loadDashboardMemos={loadDashboardMemos}
        loadCalendarMemos={loadCalendarMemos}
        openLinkModal={openLinkModal}
      />
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={closeLinkModal}
        selectedLinkMemo={selectedLinkMemo}
        loadDashboardMemos={loadDashboardMemos}
        loadCalendarMemos={loadCalendarMemos}
      />
    </div>
  );
}
