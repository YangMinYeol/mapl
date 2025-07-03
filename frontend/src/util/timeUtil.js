export function formatTimeTo12Hour(time) {
  if (!time) return "";

  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;

  const isAM = hour < 12;
  const period = isAM ? "오전" : "오후";

  // 오전 0시는 그대로 0시로 출력, 오후 12시는 12시 유지
  const displayHour = hour === 0 ? 0 : hour % 12 || 12;

  return `${period} ${displayHour}:${minute}`;
}
