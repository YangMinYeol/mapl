import MainMemoHeader from "./MainMemoHeader";
import MainMemoContent from "./MainMemoContent";

export default function MainMemo({
  dashboardDatas,
  periods,
  selectedPeriod,
  selectedDate,
  totalMemos,
  completedMemos,
  loadDashboardDatas,
  loadCalendarDatas,
  openLinkModal,
}) {
  return (
    <div className="h-[520px]">
      <MainMemoHeader
        selectedDate={selectedDate}
        selectedPeriod={selectedPeriod}
        totalMemos={totalMemos}
        completedMemos={completedMemos}
      />
      <MainMemoContent
        dashboardDatas={dashboardDatas}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        openLinkModal={openLinkModal}
      />
    </div>
  );
}
