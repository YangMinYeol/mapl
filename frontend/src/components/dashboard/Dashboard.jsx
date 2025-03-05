import PeriodSelector from "./PeriodSelector";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import { useState } from "react";

export default function Dashboard({ selectedDate }) {
  const periods = ["Day", "Week", "Month", "Year", "Bucket"];
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  return (
    <div className="w-full h-full">
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      <DashboardHeader selectedDate={selectedDate} />
      <DashboardContent />
    </div>
  );
}
