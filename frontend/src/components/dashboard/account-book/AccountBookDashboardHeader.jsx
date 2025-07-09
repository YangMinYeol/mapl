import { ACCOUNT_TYPE_FILTER } from "../../../util/accountBookUtil";
import { formatDateByPeriod } from "../../../util/dateUtil";
import Tab from "../../common/Tab";

export default function AccountBookDashboardHeader({
  filterType,
  setFilterType,
  selectedDate,
  selectedPeriod,
}) {
  const date = formatDateByPeriod(selectedDate, selectedPeriod.name, true);

  return (
    <div className="flex justify-between px-2 py-2 font-medium border-b border-mapl-slate h-[40px]">
      <Tab
        options={ACCOUNT_TYPE_FILTER}
        selected={filterType}
        onSelect={setFilterType}
      />
      <div className="dashboard-header-right">{date}</div>
    </div>
  );
}
