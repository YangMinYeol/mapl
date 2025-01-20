import { useState } from "react";

export default function PeriodSelector() {
  const periods = ["Day", "Week", "Month", "Year", "Bucket"];
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);

  const handlePeriodClick = (period) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="bg-gray-100 border-y">
      <nav>
        <ul className="flex justify-center period-nav-list">
          {periods.map((period) => (
            <li
              key={period}
              className={`${
                period === selectedPeriod &&
                "bg-gray-400 text-white hover:bg-gray-400"
              } flex items-center justify-center w-full py-2 cursor-pointer nav-item hover:bg-gray-200`}
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
