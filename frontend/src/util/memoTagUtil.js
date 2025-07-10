import { TAG_TYPE } from "../constants/tag";
import { getDateKey } from "./calendarUtil";
import { formatHolidayDate } from "./dateUtil";
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
        type: TAG_TYPE.RANGE,
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

    const visibleMemosCount = allMemos.filter(Boolean).length;

    if (visibleMemosCount > tagMaxCount) {
      truncatedMemos[tagMaxCount - 1] = {
        id: `more-${dateKey}`,
        content: `+${visibleMemosCount - (tagMaxCount - 1)}`,
        colorHex: "#ffffff",
        type: TAG_TYPE.MORE,
      };
    }

    truncatedMap[dateKey] = truncatedMemos;
  }
  return truncatedMap;
}
