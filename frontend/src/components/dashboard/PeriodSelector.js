import { useState } from "react";

export default function PeriodSelector() {
  const periods = ["Day", "Week", "Month", "Year", "Bucket"];
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);

  const handlePeriodClick = (period) => {
    if(selectedPeriod)
    setSelectedPeriod(period);
  };

  return (
    <div className="h-10 font-semibold border-y-2">
      <nav>
        <ul className="flex justify-center py-2 period-nav-list">
          {periods.map((period) => (
            <li
              key={period}
              className={`${
                period === selectedPeriod &&
                " text-green-900 underline decoration-green-900"
              } flex items-center justify-center w-full cursor-pointer nav-item hover:text-green-900 hover:underline hover:decoration-green-900`}
              onClick={() => handlePeriodClick(period)}
            >
              <span>{period}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
