import PeriodSelector from "./PeriodSelector";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import { useState } from "react";

export default function Dashboard({ selectedDate }) {
  const PERIODS = ["Day", "Week", "Month", "Year", "Bucket"];
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  return (
    <div className="w-full h-full">
      <PeriodSelector
        periods={PERIODS}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      <DashboardHeader selectedDate={selectedDate} />
      <DashboardContent selectedDate={selectedDate} />
    </div>
  );
}
