import { TABS } from "../../constants/tab";
import AccountBookDashboard from "./account-book/AccountBookDashboard";
import MemoDashboard from "./memo/MemoDashboard";

export default function Dashboard({
  activeTab,
  dashboardDatas,
  loadDashboardDatas,
  loadCalendarDatas,
  selectedDate,
  periods,
  selectedPeriod,
  setSelectedPeriod,
}) {
  return (
    <div className="h-full">
      {activeTab === TABS.MEMO ? (
        <MemoDashboard
          dashboardDatas={dashboardDatas}
          loadDashboardDatas={loadDashboardDatas}
          loadCalendarDatas={loadCalendarDatas}
          selectedDate={selectedDate}
          periods={periods}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
      ) : (
        <AccountBookDashboard
          dashboardDatas={dashboardDatas}
          loadDashboardDatas={loadDashboardDatas}
          loadCalendarDatas={loadCalendarDatas}
          selectedDate={selectedDate}
          periods={periods}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
      )}
    </div>
  );
}
