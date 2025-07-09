import { format, isSameDay, isToday } from "date-fns";
import { useEffect, useState } from "react";
import { fetchMultipleMonthsHolidays } from "../../api/holiday";
import { LINKED_MEMO } from "../../constants/messages";
import { useModal } from "../../context/ModalContext";
import {
  getDateKey,
  getDateTextColor,
  getTagMaxCount,
  getWeekDates,
} from "../../util/calendarUtil";
import { formatHolidayDate } from "../../util/dateUtil";
import {
  MEMO_MODAL_MODE,
  MEMO_TYPE,
  separateDailyAndRangeMemos,
  sortMemos,
} from "../../util/memoUtil";
import Loading from "../common/Loading";
import MemoModal from "../memo/MemoModal";
import MemoTag from "./MemoTag";

// 날짜별 메모 할당
function buildMemoLevelMap(weeks, calendarDatas, tagMaxCount, holidays) {
  const { map, dailyMemosMap } = buildDateMemoMap(weeks);
  const { dailyMemos, rangeMemos } = separateDailyAndRangeMemos(calendarDatas);
  addHolidayMemos(dailyMemos, holidays);

  for (const key in dailyMemos) {
    if (dailyMemosMap[key]) {
      dailyMemosMap[key] = dailyMemos[key];
    }
  }

  placeRangeMemosInLevels(map, rangeMemos);
  placeDailyMemosInLevels(map, dailyMemosMap);
  return truncateMemoMap(map, tagMaxCount);
}

// 1. 날짜 메모 맵을 작성
function buildDateMemoMap(weeks) {
  const map = {};
  const dailyMemosMap = {};
  weeks.forEach((week) => {
    week.forEach((date) => {
      const key = getDateKey(date);
      map[key] = [];
      dailyMemosMap[key] = [];
    });
  });
  return { map, dailyMemosMap };
}

// 2. 공휴일 추가
function addHolidayMemos(dailyMemos, holidays) {
  holidays.forEach((holiday) => {
    const dateStr = formatHolidayDate(holiday.locdate);
    const memo = {
      id: `holiday-${holiday.locdate}-${holiday.seq}`,
      content: holiday.dateName,
      colorHex: "#ce5f65",
      type: MEMO_TYPE.HOLIDAY,
    };

    if (!dailyMemos[dateStr]) {
      dailyMemos[dateStr] = [];
    }

    dailyMemos[dateStr].push(memo);
  });

  return dailyMemos;
}

// 3. 기간 메모 Level 지정
function placeRangeMemosInLevels(map, rangeMemos) {
  const sortedMemos = sortMemos(rangeMemos, false);
  const maxLevels = 100;
  const usedLevelsMap = {};

  for (const memo of sortedMemos) {
    const start = new Date(memo.startDate);
    const end = new Date(memo.endDate);
    let level = 0;

    levelLoop: for (; level < maxLevels; level++) {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = getDateKey(d);
        if (!usedLevelsMap[key]) usedLevelsMap[key] = new Set();
        if (usedLevelsMap[key].has(level)) {
          continue levelLoop;
        }
      }
      break;
    }

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = getDateKey(d);
      if (!map[key]) map[key] = [];
      map[key][level] = {
        ...memo,
        level,
        type: MEMO_TYPE.RANGE,
      };
      usedLevelsMap[key].add(level);
    }
  }
}
// 4. 데일리 메모 Levle 지정
function placeDailyMemosInLevels(map, dailyMemos) {
  for (const key in dailyMemos) {
    const sortedMemos = sortMemos(dailyMemos[key], true);
    const current = map[key] ?? [];

    for (const memo of sortedMemos) {
      let level = 0;
      while (current[level] !== undefined) level++;
      current[level] = {
        ...memo,
        level,
        type: memo.type === MEMO_TYPE.HOLIDAY ? memo.type : MEMO_TYPE.DAILY,
      };
    }

    map[key] = current;
  }
}

// 5. 최종 사용 메모 맵
function truncateMemoMap(memoMap, tagMaxCount) {
  const truncatedMap = {};

  for (const dateKey in memoMap) {
    const allMemos = memoMap[dateKey] ?? [];
    const truncatedMemos = [];

    for (let i = 0; i < tagMaxCount; i++) {
      truncatedMemos.push(allMemos[i] ?? null);
    }

    const visibleMemosCount = allMemos.filter(Boolean).length;

    if (visibleMemosCount > tagMaxCount) {
      truncatedMemos[tagMaxCount - 1] = {
        id: `more-${dateKey}`,
        content: `+${visibleMemosCount - (tagMaxCount - 1)}`,
        colorHex: "#ffffff",
        type: MEMO_TYPE.MORE,
      };
    }

    truncatedMap[dateKey] = truncatedMemos;
  }
  return truncatedMap;
}

export default function CalendarDate({
  currentDate,
  selectedDate,
  setSelectedDate,
  calendarDatas,
  loadDashboardDatas,
  loadCalendarDatas,
  periods,
  setSelectedPeriod,
}) {
  const weeks = getWeekDates(currentDate);
  const tagMaxCount = getTagMaxCount(weeks);
  const [holidays, setHolidays] = useState([]);
  const memoLevelMap = buildMemoLevelMap(
    weeks,
    calendarDatas,
    tagMaxCount,
    holidays
  );
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const { openConfirm } = useModal();

  // 공휴일 데이터 fetch
  useEffect(() => {
    const loadHolidays = async () => {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await fetchMultipleMonthsHolidays(year, month);
      setHolidays(data);
      setIsLoading(false);
    };
    loadHolidays();
  }, [currentDate]);

  // 메모 클릭 시 동작
  function handleMemoClick(memo) {
    if (memo.type === MEMO_TYPE.MORE || memo.type === MEMO_TYPE.HOLIDAY) return;

    if (memo.isLinked) {
      openConfirm(LINKED_MEMO.TITLE, LINKED_MEMO.EDIT_CONFIRM, async () => {
        setSelectedMemo(memo);
        setIsMemoModalOpen(true);
      });
    } else {
      setSelectedMemo(memo);
      setIsMemoModalOpen(true);
    }
  }

  function handleDateClick(date) {
    setSelectedDate(date);
    setSelectedPeriod(periods[0]);
  }
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div
      className={`grid flex-1 grid-rows-${weeks.length} gap-[1px] bg-gray-200 h-[820px]`}
    >
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((date, dateIndex) => {
            const key = getDateKey(date);
            const memoTags =
              memoLevelMap[key] ?? new Array(tagMaxCount).fill(null);

            return (
              <div
                key={dateIndex}
                className={`date-cell flex flex-col h-full ${
                  isSameDay(date, selectedDate)
                    ? "bg-gray-100"
                    : "hover:bg-gray-50 bg-white"
                }`}
                onClick={() => handleDateClick(date)}
              >
                {/* 날짜 */}
                <div
                  className={`flex items-center justify-center rounded-full w-[24px] h-[24px] date-label hover:cursor-default ${getDateTextColor(
                    date,
                    currentDate,
                    holidays
                  )} ${isToday(date) && "text-white bg-deep-green"}`}
                >
                  {format(date, "d")}
                </div>

                {/* 메모 태그 */}
                <div className="flex flex-col gap-[1px]">
                  {memoTags.map((memo, i) => (
                    <MemoTag
                      key={memo?.id ?? `placeholder-${i}`}
                      memo={memo}
                      date={date}
                      onClick={() => handleMemoClick(memo)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <MemoModal
        isOpen={isMemoModalOpen}
        onClose={() => {
          setIsMemoModalOpen(false);
          setSelectedMemo(null);
        }}
        selectedDate={selectedDate}
        mode={MEMO_MODAL_MODE.EDIT}
        memo={selectedMemo}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        selectedPeriod={periods[0]}
      />
    </div>
  );
}
