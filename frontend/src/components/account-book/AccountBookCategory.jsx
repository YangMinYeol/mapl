import { useState } from "react";
import useCategoryStore from "../../stores/useCategoryStore";
import { ACCOUNT_TYPE, ACCOUNT_TYPE_FILTER } from "../../util/accountBookUtil";
import Tab from "../common/Tab";

const tabOptions = ACCOUNT_TYPE_FILTER.filter(
  (item) => item.value !== ACCOUNT_TYPE.ALL
);

export default function AccountBookCategory() {
  const [selectedTab, setSelectedTab] = useState(ACCOUNT_TYPE.EXPENSE);
  const categories = useCategoryStore((state) =>
    selectedTab === ACCOUNT_TYPE.EXPENSE
      ? state.expenseCategories
      : state.incomeCategories
  );

  return (
    <div>
      <Tab
        options={tabOptions}
        selected={selectedTab}
        onSelect={setSelectedTab}
        size="lg"
      />
      <div className="py-5 space-y-2">
        {categories.map(({ id, name, colorHex, isDefault }) => (
          <div
            key={id}
            className="flex items-center justify-between flex-shrink-0 px-4 py-3 transition border rounded border-mapl-slate hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: colorHex }}
              />
              <span className="text-base whitespace-nowrap">{name}</span>
            </div>

            <div className="flex gap-3 text-sm text-gray-500 whitespace-nowrap">
              {!isDefault && (
                <>
                  <button className="cursor-pointer hover:text-green-900">
                    삭제
                  </button>
                  <span>|</span>
                </>
              )}
              <button className="cursor-pointer hover:text-green-900">
                수정
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button className="w-full h-12 text-base font-medium border rounded border-mapl-slate hover:cursor-pointer">
          카테고리 추가
        </button>
      </div>
    </div>
  );
}
