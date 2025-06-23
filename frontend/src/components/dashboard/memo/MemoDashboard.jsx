import { useEffect, useState } from "react";
import LinkModal from "../../link/LinkModal";
import PeriodSelector from "./../PeriodSelector";
import MainMemo from "./../memo/main/MainMemo";
import SubMemo from "./../memo/sub/SubMemo";

export default function MemoDashboard({
  dashboardDatas,
  loadDashboardDatas,
  loadCalendarDatas,
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
      updateCount(dashboardDatas);
    }
  }, [selectedPeriod, dashboardDatas]);

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
    <>
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      <MainMemo
        dashboardDatas={dashboardDatas}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        totalMemos={totalMemos}
        completedMemos={completedMemos}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        openLinkModal={openLinkModal}
      />
      <SubMemo
        dashboardDatas={dashboardDatas}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        openLinkModal={openLinkModal}
      />
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={closeLinkModal}
        selectedLinkMemo={selectedLinkMemo}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
      />
    </>
  );
}
