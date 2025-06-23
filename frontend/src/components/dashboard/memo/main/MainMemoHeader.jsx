import { formatDateByPeriod } from "../../../../util/dateUtil";

export default function MainMemoHeader({
  selectedDate,
  selectedPeriod,
  totalMemos,
  completedMemos,
}) {
  const date = formatDateByPeriod(selectedDate, selectedPeriod.name, false);

  return (
    <div className="flex justify-between px-2 py-2 font-medium border-b border-mapl-slate h-[40px]">
      <div className="dashboard-header-left">
        <span>{date}</span>
      </div>
      <div className="dashboard-header-right">
        {completedMemos}/{totalMemos}
      </div>
    </div>
  );
}
