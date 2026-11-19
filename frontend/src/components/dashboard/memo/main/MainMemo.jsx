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
  onEdit,
}) {
  return (
    <section className="planner-panel primary-panel" aria-label="선택한 기간 메모">
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
        onEdit={onEdit}
      />
    </section>
  );
}
