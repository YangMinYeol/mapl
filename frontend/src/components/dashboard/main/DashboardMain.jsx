import DashboardMainHeader from "./DashboardMainHeader";
import DashboardMainContent from "./DashboardMainContent";

export default function DashboardMain({
  memos,
  periods,
  selectedPeriod,
  selectedDate,
  totalMemos,
  completedMemos,
  refreshMemoList,
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
        memos={memos}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        refreshMemoList={refreshMemoList}
      />
    </div>
  );
}
