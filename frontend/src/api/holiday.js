const serviceKey = encodeURIComponent(
  "e53dac4cf55906c81f985bc5f872e85a58a3ec72e26cf24d5c0cd79248150b95"
);

// 단일 월 공휴일 요청
export const fetchHolidays = async (year, month) => {
  const paddedMonth = String(month).padStart(2, "0");
  const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?serviceKey=${serviceKey}&solYear=${year}&solMonth=${paddedMonth}&_type=json`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    const items = result.response.body.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error("공휴일 요청 실패:", error);
    return [];
  }
};

// 달력에 걸쳐 보이는 이전·현재·다음 달을 요청한다.
export async function fetchMultipleMonthsHolidays(year, month) {
  const months = [-1, 0, 1].map((offset) => new Date(year, month - 1 + offset, 1));
  const lists = await Promise.all(months.map((date) => fetchHolidays(date.getFullYear(), date.getMonth() + 1)));
  return lists.flat();
}
