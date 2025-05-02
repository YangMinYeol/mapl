export const MEMO_TYPE = {
  DAILY: "daily",
  RANGE: "range",
  MORE: "more",
};

export function sortMemos(memos, isDaily) {
  return memos.sort((a, b) => {
    if (isDaily) {
      // 1. AllDay가 우선
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
