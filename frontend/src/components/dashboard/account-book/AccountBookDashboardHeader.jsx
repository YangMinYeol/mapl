import { ACCOUNT_TYPE_FILTER } from "../../../util/accountBookUtil";
import { formatDateByPeriod } from "../../../util/dateUtil";

export default function AccountBookDashboardHeader({
  filterType,
  setFilterType,
  selectedDate,
  selectedPeriod,
}) {
  const date = formatDateByPeriod(selectedDate, selectedPeriod.name, true);

  return (
    <div className="ledger-header">
      <div className="ledger-filters" role="group" aria-label="가계부 내역 필터">
        {ACCOUNT_TYPE_FILTER.map(({ label, value }) => (
          <button key={value} type="button" aria-pressed={filterType === value} onClick={() => setFilterType(value)}>
            {label}
          </button>
        ))}
      </div>
      <div className="dashboard-header-right">{date}</div>
    </div>
  );
}
