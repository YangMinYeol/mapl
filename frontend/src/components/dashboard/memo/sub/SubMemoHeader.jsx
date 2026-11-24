import { getPeriodDisplayName } from "../../../../util/periodUtil";
import Dropdown from "../../../common/Dropdown";

export default function SubMemoHeader({
  filterPeriods,
  selectedValue,
  handleChange,
  handleAddMemo,
  isImporting,
  isBucketList,
}) {
  return (
    <div className="flex p-2 border-b header border-mapl-slate h-[40px]">
      <div className="w-14/16">
        <Dropdown
          compact
          aria-label="상위 메모 기간"
          value={selectedValue}
          onChange={handleChange}
        >
          {filterPeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {getPeriodDisplayName(period.name, "memo")}
            </option>
          ))}
        </Dropdown>
      </div>
      <div className="text-right w-2/16">
        {!isBucketList && (
          <button
            type="button"
            className="planner-action"
            onClick={handleAddMemo}
            disabled={isImporting}
            aria-busy={isImporting}
          >
            가져오기
          </button>
        )}
      </div>
    </div>
  );
}
