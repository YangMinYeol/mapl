import { useState } from "react";
import PeriodSelector from "../PeriodSelector";
import AccountBookDashboardContent from "./AccountBookDashboardContent";
import AccountBookDashboardHeader from "./AccountBookDashboardHeader";
import { FILTER_TYPE_VALUE } from "../../../util/accountBookUtil";

export default function AccountBookDashboard({
  dashboardDatas,
  loadDashboardDatas,
  loadCalendarDatas,
  selectedDate,
  periods,
  selectedPeriod,
  setSelectedPeriod,
}) {
  const [filterType, setFilterType] = useState(FILTER_TYPE_VALUE.ALL);

  return (
    <>
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        isAccountBook={true}
      />
      <AccountBookDashboardHeader
        filterType={filterType}
        setFilterType={setFilterType}
        selectedDate={selectedDate}
        selectedPeriod={selectedPeriod}
      />
      <AccountBookDashboardContent
        dashboardDatas={dashboardDatas}
        selectedDate={selectedDate}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        selectedPeriod={selectedPeriod}
        filterType={filterType}
      />
    </>
  );
}
