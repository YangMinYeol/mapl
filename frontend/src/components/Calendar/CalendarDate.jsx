import { format, isSameDay, isToday } from "date-fns";
import { getDateTextColor, getWeekDates } from "../../util/calendarUtil";

export default function CalendarDate({
  currentDate,
  selectedDate,
  setSelectedDate,
  calendarMemos,
}) {
  const weeks = getWeekDates(currentDate);

  // weeks.length에 따라 tagMaxCount 설정
  let tagMaxCount = 5;

  if (weeks.length === 4) {
    tagMaxCount = 8;
  } else if (weeks.length === 5) {
    tagMaxCount = 6;
  } else if (weeks.length === 6) {
    tagMaxCount = 5;
  }

  // 메모 태그 생성
  function getDailyMemoTags(date, tagMaxCount) {
    const filteredMemos = calendarMemos.filter(
      (memo) => isSameDay(new Date(memo.startDate), date) && memo.periodId === 1
    );

    const memoCount = filteredMemos.length;

    // 1. 메모 수가 tagMaxCount보다 크면 → 앞에서 (tagMaxCount - 1)개 보여주고 마지막에 +n
    if (memoCount > tagMaxCount) {
      const showMemos = filteredMemos.slice(0, tagMaxCount - 1);
      const hiddenCount = memoCount - (tagMaxCount - 1);
      return [
        ...showMemos,
        { id: "extra", content: `+${hiddenCount}`, colorHex: "#173836" },
      ];
    }

    // 2. 딱 맞는 경우 → 그대로 다 보여주기
    if (memoCount === tagMaxCount) {
      return filteredMemos;
    }

    // 3. 부족한 경우 → 나머지를 null로 채우기
    const nullCount = tagMaxCount - memoCount;
    return [...filteredMemos, ...Array(nullCount).fill(null)];
  }

  return (
    <div
      className={`grid flex-1 grid-rows-${weeks.length} gap-[1px] bg-gray-200 h-[820px]`}
    >
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-[1px] ">
          {week.map((date, dateIndex) => {
            const memoTags = getDailyMemoTags(date, tagMaxCount);
            return (
              <div
                key={dateIndex}
                className={`date-cell flex flex-col p-[1px] h-full ${
                  isSameDay(date, selectedDate)
                    ? "bg-gray-100"
                    : "hover:bg-gray-50 bg-white"
                }`}
                onClick={() => setSelectedDate(date)}
              >
                {/* 날짜 */}
                <div
                  className={`flex items-center justify-center rounded-full w-[24px] h-[24px] date-label hover:cursor-default ${getDateTextColor(
                    date,
                    currentDate
                  )} ${isToday(date) && "text-white bg-deep-green"}`}
                >
                  {format(date, "d")}
                </div>

                {/* 메모 태그 */}
                <div className="flex flex-col gap-[2px] px-1 overflow-hidden">
                  {memoTags.map((memo, i) => (
                    <div
                      key={memo?.id ?? `placeholder-${i}`}
                      className="rounded px-1 h-[20px] text-white truncate"
                      style={memo ? { backgroundColor: memo.colorHex } : {}}
                    >
                      {memo?.content ?? ""}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
