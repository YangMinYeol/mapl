import { getDateKey } from "./calendarUtil";

export const MEMO_TYPE = {
  DAILY: "daily",
  RANGE: "range",
  MORE: "more",
  HOLIDAY: "holiday",
};

export const MEMO_MODAL_MODE = {
  CREATE: "create",
  EDIT: "edit",
};

// 데일리 메모와 범위 메모 분류
export function separateDailyAndRangeMemos(memos) {
  const dailyMemos = {};
  const rangeMemos = [];

  for (const memo of memos) {
    if (memo.periodId !== 1) continue;

    const start = new Date(memo.startDate);
    const end = new Date(memo.endDate);
    const key = getDateKey(start);
    const isDaily = start.toDateString() === end.toDateString();

    if (isDaily) {
      if (!dailyMemos[key]) dailyMemos[key] = [];
      dailyMemos[key].push(memo);
    } else {
      rangeMemos.push(memo);
    }
  }

  return { dailyMemos, rangeMemos };
}

export function dailyMemoObjectToArray(dailyMemosObj) {
  return Object.values(dailyMemosObj).flat();
}

export function sortMemos(memos, isDaily) {
  return memos.sort((a, b) => {
    if (isDaily) {
      // 1. 공휴일 우선
      if (a.type === MEMO_TYPE.HOLIDAY && b.type !== MEMO_TYPE.HOLIDAY)
        return -1;
      if (a.type !== MEMO_TYPE.HOLIDAY && b.type === MEMO_TYPE.HOLIDAY)
        return 1;

      // 2. AllDay가 우선
      if (a.allday && !b.allday) return -1;
      if (!a.allday && b.allday) return 1;
    } else {
      // 1. 시작 날짜가 빠를수록 우선
      const startDateA = new Date(a.startDate);
      const startDateB = new Date(b.startDate);
      if (startDateA < startDateB) return -1;
      if (startDateA > startDateB) return 1;

      // 2. 끝 날짜가 늦을수록 우선
      const endDateA = new Date(a.endDate);
      const endDateB = new Date(b.endDate);
      if (endDateA > endDateB) return -1;
      if (endDateA < endDateB) return 1;
    }
    // 시작 시간이 빠를수록 우선
    if (a.startTime < b.startTime) return -1;
    if (a.startTime > b.startTime) return 1;

    // 끝 시간이 늦을수록 우선
    if (a.endTime > b.endTime) return -1;
    if (a.endTime < b.endTime) return 1;

    // created_at이 빠를수록 우선
    const createdDateA = new Date(a.createdAt);
    const createdDateB = new Date(b.createdAt);
    if (createdDateA < createdDateB) return -1;
    if (createdDateA > createdDateB) return 1;

    // id가 빠를수록 우선
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
  });
}
