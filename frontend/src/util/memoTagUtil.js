import { TAG_TYPE } from "../constants/tag";
import { getDateKey } from "./calendarUtil";
import { formatDateYYYYMMDD, formatHolidayDate } from "./dateUtil";
import { separateDailyAndRangeMemos, sortMemos } from "./memoUtil";

// 날짜별 메모 할당
export function buildMemoLevelMap(weeks, calendarDatas, tagMaxCount, holidays) {
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
      type: TAG_TYPE.HOLIDAY,
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
  const visibleDates = Object.keys(map);

  for (const memo of sortedMemos) {
    const start = formatDateYYYYMMDD(memo.startDate);
    const end = formatDateYYYYMMDD(memo.endDate);
    const dates = visibleDates.filter((date) => date >= start && date <= end);
    if (dates.length === 0) continue;

    let level = 0;
    // 날짜가 바뀌어도 이어지는 기간 메모는 같은 줄에 표시한다.
    while (dates.some((date) => map[date][level] !== undefined)) level++;

    for (const date of dates) {
      map[date][level] = {
        ...memo,
        level,
        type: TAG_TYPE.RANGE,
      };
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
        type: memo.type === TAG_TYPE.HOLIDAY ? memo.type : TAG_TYPE.DAILY,
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

    const hiddenCount = allMemos.slice(tagMaxCount).filter(Boolean).length;

    if (hiddenCount > 0) {
      const overflowCount = hiddenCount + Number(Boolean(truncatedMemos[tagMaxCount - 1]));
      truncatedMemos[tagMaxCount - 1] = {
        id: `more-${dateKey}`,
        content: `+${overflowCount}개`,
        type: TAG_TYPE.MORE,
      };
    }

    truncatedMap[dateKey] = truncatedMemos;
  }
  return truncatedMap;
}
