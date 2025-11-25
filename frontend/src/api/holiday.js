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

// 여러 달(예: 3개월) 공휴일 요청
export const fetchMultipleMonthsHolidays = async (
  year,
  startMonth,
  count = 3
) => {
  const allHolidays = [];

  for (let i = 0; i < count; i++) {
    const month = startMonth + i;
    const holidays = await fetchHolidays(year, month);
    allHolidays.push(...holidays);
  }

  return allHolidays;
};
