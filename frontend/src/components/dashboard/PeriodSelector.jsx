import { getPeriodDisplayName } from "../../util/periodUtil";

export default function PeriodSelector({
  periods,
  selectedPeriod,
  setSelectedPeriod,
  isAccountBook = false,
}) {
  return (
    <div className="h-[40px] font-medium border-y-1 border-mapl-slate">
      <nav>
        <div className="flex justify-center py-2 period-nav-list">
          {periods.map((period) => (
            <div
              key={period.id}
              className={`flex-1 min-w-0 flex items-center justify-center cursor-pointer nav-item hover:text-green-900 hover:underline hover:decoration-green-900 ${
                period.id === selectedPeriod.id
                  ? "text-green-900 underline decoration-green-900"
                  : ""
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              <span className=" whitespace-nowrap">
                {isAccountBook
                  ? getPeriodDisplayName(period.name, "accountBook")
                  : getPeriodDisplayName(period.name, "memo")}
              </span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
