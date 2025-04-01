export default function DashboardSubHeader({
  filterPeriods,
  selectedValue,
  handleChange,
  handleAddMemo,
}) {
  return (
    <div className="flex p-2 border-b header border-mapl-slate h-[40px]">
      <div className="w-14/16">
        <select
          className="h-full border rounded outline-none border-mapl-black"
          value={selectedValue}
          onChange={handleChange}
        >
          {filterPeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
      </div>
      <div className="text-right w-2/16">
        <button
          className="px-2 font-semibold bg-white border rounded cursor-pointer border-deep-green text-deep-green hover:text-white hover:bg-deep-green"
          onClick={handleAddMemo}
        >
          추가
        </button>
      </div>
    </div>
  );
}
