import SubMemoItem from "./SubMemoItem";
import { memoEmptyMessages } from "../memoEmptyMessages";

export default function SubMemoContent({
  dashboardDatas,
  selectedValue,
  selectedPeriodName,
  quote,
  checkedIds,
  handleToggle,
  isBucketList,
  openLinkModal,
  onEdit,
}) {
  const visibleMemos = dashboardDatas.filter(
    (memo) => memo.periodId === Number(selectedValue) && !memo.completed
  );
  return (
    <div className={`h-[300px] overflow-auto dashboard-sub-content${isBucketList ? " bucket-quote-content" : ""}`}>
      {isBucketList ? (
        <div className="bucket-quote px-4 py-6 text-center">
          <p className="mb-2 text-xl font-semibold text-gray-700">
            “{quote.quoteKr}”
          </p>
          <p className="text-sm text-gray-500">– {quote.author}</p>
          <p className="mt-1 text-xs italic text-gray-400">
            {quote.quote}
          </p>
        </div>
      ) : visibleMemos.length === 0 ? (
        <p className="memo-empty">{memoEmptyMessages[selectedPeriodName] ?? "계획하고 있는 일을 적어보세요."}</p>
      ) : (
        <ul>
          {visibleMemos.map((memo) => (
            <li key={memo.id}>
              <SubMemoItem
                memo={memo}
                checked={checkedIds.includes(memo.id)}
                onToggle={() => handleToggle(memo.id)}
                openLinkModal={openLinkModal}
                onEdit={() => onEdit(memo)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
