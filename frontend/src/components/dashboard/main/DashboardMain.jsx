import DashboardMainHeader from "./DashboardMainHeader";
import DashboardMainContent from "./DashboardMainContent";

export default function DashboardMain({
  dashboardMemos,
  periods,
  selectedPeriod,
  selectedDate,
  totalMemos,
  completedMemos,
  loadDashboardMemos,
  loadCalendarMemos,
}) {
  return (
    <div className="h-[520px]">
      <DashboardMainHeader
        selectedDate={selectedDate}
        selectedPeriod={selectedPeriod}
        totalMemos={totalMemos}
        completedMemos={completedMemos}
      />
      <DashboardMainContent
        dashboardMemos={dashboardMemos}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        loadDashboardMemos={loadDashboardMemos}
        loadCalendarMemos={loadCalendarMemos}
      />
    </div>
  );
}
