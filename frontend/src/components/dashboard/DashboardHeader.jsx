import { format } from "date-fns";

export default function DashboardHeader({ selectedDate }) {
  const date = format(selectedDate, "yyyy년 MM월 dd일");

  return (
    <div className="flex justify-between px-2 py-2 font-medium">
      <div className="dashboard-header-left">
        <span>{date}</span>
      </div>
      <div className="dashboard-header-right">count/total</div>
    </div>
  );
}
