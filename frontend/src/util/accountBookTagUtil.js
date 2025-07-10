import { TAG_TYPE } from "../constants/tag";
import { getDateKey } from "./calendarUtil";
import { formatDateYYYYMMDD, formatHolidayDate } from "./dateUtil";

// 달력 구조에 맞게 날짜별 태그 map 생성
export function generateAccountBookTagMap(
  weeks,
  calendarDatas,
  holidays,
  tagMaxCount
) {
  const tagMap = initEmptyTagMapByWeeks(weeks);
  insertHolidayTagsToMap(tagMap, holidays);
  insertAccountTagsToMap(tagMap, calendarDatas);
  return fillTagMapToMaxCount(tagMap, tagMaxCount);
}

// 날짜별 빈 배열을 초기화
function initEmptyTagMapByWeeks(weeks) {
  const map = {};
  weeks.forEach((week) => {
    week.forEach((date) => {
      const key = getDateKey(date);
      map[key] = [];
    });
  });
  return map;
}

// 공휴일 데이터를 날짜별 맵에 추가
function insertHolidayTagsToMap(tagMap, holidays) {
  holidays.forEach((holiday) => {
    const key = formatHolidayDate(holiday.locdate);
    const tag = {
      id: `holiday-${holiday.locdate}-${holiday.seq}`,
      content: holiday.dateName,
      colorHex: "#ce5f65",
      type: TAG_TYPE.HOLIDAY,
    };

    if (!tagMap[key]) tagMap[key] = [];
    tagMap[key].push(tag);
  });
}

// 가계부 항목을 날짜별 map에 추가
function insertAccountTagsToMap(tagMap, datas) {
  datas.forEach((item) => {
    const key = formatDateYYYYMMDD(item.occurredAt);
    if (!tagMap[key]) tagMap[key] = [];
    tagMap[key].push(item);
  });

  for (const key in tagMap) {
    tagMap[key].sort((a, b) => {
      const isHolidayA = a.type === TAG_TYPE.HOLIDAY;
      const isHolidayB = b.type === TAG_TYPE.HOLIDAY;

      if (isHolidayA && !isHolidayB) return -1;
      if (!isHolidayA && isHolidayB) return 1;
      if (isHolidayA && isHolidayB) return 0;

      // 둘 다 가계부 항목일 경우: occurredAt → createdAt 기준으로 정렬
      const occurredDiff = new Date(a.occurredAt) - new Date(b.occurredAt);
      if (occurredDiff !== 0) return occurredDiff;

      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }
}

// 각 날짜별 태그 수를 tagMaxCount만큼 보정하고, 초과 시 +N 태그 추가
function fillTagMapToMaxCount(tagMap, tagMaxCount) {
  const filledMap = {};
  for (const dateKey in tagMap) {
    const tags = tagMap[dateKey];
    const filled = [];

    const visibleCount = tags.length;

    for (let i = 0; i < tagMaxCount; i++) {
      filled.push(tags[i] ?? null);
    }

    if (visibleCount > tagMaxCount) {
      filled[tagMaxCount - 1] = {
        id: `more-${dateKey}`,
        content: `+${visibleCount - (tagMaxCount - 1)}`,
        colorHex: "#ffffff",
        type: TAG_TYPE.MORE,
      };
    }

    filledMap[dateKey] = filled;
  }
  return filledMap;
}
