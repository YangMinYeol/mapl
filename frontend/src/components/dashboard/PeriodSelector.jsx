export default function PeriodSelector({
  periods,
  selectedPeriod,
  handleSelectedPeriod,
}) {
  return (
    <div className="h-10 font-medium border-y-1 border-mapl-slate">
      <nav>
        <ul className="flex justify-center py-2 period-nav-list">
          {periods.map((period) => (
            <li
              key={period.id}
              className={`${
                period.id === selectedPeriod.id &&
                " text-green-900 underline decoration-green-900"
              } flex items-center justify-center w-full cursor-pointer nav-item hover:text-green-900 hover:underline hover:decoration-green-900`}
              onClick={() => handleSelectedPeriod(period)}
            >
              <span>{period.name}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
