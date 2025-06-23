import MainMemoHeader from "./MainMemoHeader";
import MainMemoContent from "./MainMemoContent";

export default function MainMemo({
  dashboardMemos,
  periods,
  selectedPeriod,
  selectedDate,
  totalMemos,
  completedMemos,
  loadDashboardMemos,
  loadCalendarMemos,
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
        dashboardMemos={dashboardMemos}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        loadDashboardMemos={loadDashboardMemos}
        loadCalendarMemos={loadCalendarMemos}
        openLinkModal={openLinkModal}
      />
    </div>
  );
}
