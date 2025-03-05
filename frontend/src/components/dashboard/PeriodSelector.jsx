export default function PeriodSelector({
  periods,
  selectedPeriod,
  setSelectedPeriod,
}) {
  return (
    <div className="h-10 font-medium border-y-2">
      <nav>
        <ul className="flex justify-center py-2 period-nav-list">
          {periods.map((period) => (
            <li
              key={period}
              className={`${
                period === selectedPeriod &&
                " text-green-900 underline decoration-green-900"
              } flex items-center justify-center w-full cursor-pointer nav-item hover:text-green-900 hover:underline hover:decoration-green-900`}
              onClick={() => setSelectedPeriod(period)}
            >
              <span>{period}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
