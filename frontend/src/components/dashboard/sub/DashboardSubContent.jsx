import DashboardSubMemoItem from "./DashboardSubMemoItem";
import { bucketQuotes } from "../../../constants/bucketQuotes";

function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * bucketQuotes.length);
  return bucketQuotes[randomIndex];
}

export default function DashboardSubContent({
  dashboardMemos,
  selectedValue,
  checkedIds,
  handleToggle,
  isBucketList,
  openLinkModal,
}) {
  const randomQuote = getRandomQuote();
  return (
    <div className="h-[300px] overflow-auto dashboard-sub-content">
      {isBucketList ? (
        <div className="px-2 py-6 text-center">
          <p className="mb-2 text-xl font-semibold text-gray-700">
            “{randomQuote.quoteKr}”
          </p>
          <p className="text-sm text-gray-500">– {randomQuote.author}</p>
          <p className="mt-1 text-xs italic text-gray-400">
            {randomQuote.quote}
          </p>
        </div>
      ) : (
        <ul>
          {dashboardMemos
            .filter((memo) => memo.periodId == selectedValue && !memo.completed)
            .map((memo) => (
              <li key={memo.id}>
                <DashboardSubMemoItem
                  memo={memo}
                  checked={checkedIds.includes(memo.id)}
                  onToggle={() => handleToggle(memo.id)}
                  openLinkModal={openLinkModal}
                />
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
