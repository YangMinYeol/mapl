import DashboardSubMemoItem from "./DashboardSubMemoItem";

export default function DashboardSubContent({ memos, selectedValue }) {
  return (
    <div className="h-[300px] overflow-auto dashboard-sub-content">
      <ul>
        {memos
          .filter((memo) => memo.periodId == selectedValue)
          .map((memo) => (
            <li key={memo.id}>
              <DashboardSubMemoItem memo={memo} />
            </li>
          ))}
      </ul>
    </div>
  );
}
