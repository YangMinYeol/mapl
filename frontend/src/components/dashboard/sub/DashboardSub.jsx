import DashboardSubHeader from "./DashboardSubHeader";
import DashboardSubContent from "./DashboardSubContent";
import { useEffect, useState, useMemo } from "react";

export default function DashboardSub({ memos, periods, selectedPeriod }) {
  const periodFilterMap = {
    Day: ["Week", "Month", "Year", "Bucket List"],
    Week: ["Month", "Year", "Bucket List"],
    Month: ["Year", "Bucket List"],
    Year: ["Bucket List"],
    "Bucket List": ["kkk"],
  };

  const filterPeriods = useMemo(() => {
    return periods.filter((period) =>
      periodFilterMap[selectedPeriod.name]?.includes(period.name)
    );
  }, [selectedPeriod, periods]);

  const [selectedValue, setSelectedValue] = useState(filterPeriods[0]?.id);

  useEffect(() => {
    setSelectedValue(filterPeriods[0]?.id);
  }, [filterPeriods]);

  return (
    <div className="h-[340px]">
      <DashboardSubHeader
        filterPeriods={filterPeriods}
        selectedValue={selectedValue}
        handleChange={(e) => setSelectedValue(e.target.value)}
      />
      <DashboardSubContent memos={memos} selectedValue={selectedValue} />
    </div>
  );
}
