import { format, getWeekOfMonth } from "date-fns";

export default function DashboardMainHeader({
  selectedDate,
  selectedPeriod,
  totalMemos,
  completedMemos,
}) {
  let formattedDate = "yyyy년 MM월 dd일";

  switch (selectedPeriod.name) {
    case "Day":
      formattedDate = "yyyy년 MM월 dd일";
      break;
    case "Week":
      formattedDate = `yyyy년 MM월 ${getWeekOfMonth(selectedDate)}주차`;
      break;
    case "Month":
      formattedDate = "yyyy년 MM월";
      break;
    case "Year":
      formattedDate = "yyyy년";
      break;
    case "Bucket List": //꿈을 기록하는 것이 목표가 되고, 목표를 쪼개면 계획이 되며, 계획을 실행하면 꿈은 현실이 된다.
      formattedDate = "버킷 리스트";
      break;
  }
  const date = format(selectedDate, formattedDate);

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
