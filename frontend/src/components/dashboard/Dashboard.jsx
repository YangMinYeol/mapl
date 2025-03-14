import PeriodSelector from "./PeriodSelector";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import { useState } from "react";

export default function Dashboard({ selectedDate }) {
  const PERIODS = ["Day", "Week", "Month", "Year", "Bucket"];
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [totalMemos, setTotalMemos] = useState(0);
  const [completedMemos, setCompletedMemos] = useState(0);

  function handleMemoCountUpdate(total, completed) {
    setTotalMemos(total);
    setCompletedMemos(completed);
  }

  return (
    <div className="w-full h-full">
      <PeriodSelector
        periods={PERIODS}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      <DashboardHeader
        selectedDate={selectedDate}
        totalMemos={totalMemos}
        completedMemos={completedMemos}
      />
      <DashboardContent
        selectedDate={selectedDate}
        onMemoCounteUpdate={handleMemoCountUpdate}
      />
    </div>
  );
}
