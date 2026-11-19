import { useState } from "react";
import PeriodSelector from "../PeriodSelector";
import AccountBookDashboardContent from "./AccountBookDashboardContent";
import AccountBookDashboardHeader from "./AccountBookDashboardHeader";
import { ACCOUNT_TYPE } from "../../../util/accountBookUtil";
import { AccountBookPieChart } from "./AccountBookPieChart";
import SecondaryPanel from "../SecondaryPanel";

export default function AccountBookDashboard({
  dashboardDatas,
  loadDashboardDatas,
  loadCalendarDatas,
  selectedDate,
  periods,
  selectedPeriod,
  setSelectedPeriod,
}) {
  const [filterType, setFilterType] = useState(ACCOUNT_TYPE.ALL);

  return (
    <>
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        isAccountBook={true}
      />
      <section className="planner-panel primary-panel" aria-label="가계부 내역">
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
      </section>
      <SecondaryPanel label="수입·지출 차트" className="ledger-chart-panel">
        <h2 className="ledger-chart-heading">수입·지출 차트</h2>
        <AccountBookPieChart dashboardDatas={dashboardDatas} />
      </SecondaryPanel>
    </>
  );
}
