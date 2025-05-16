export function formatTimeTo12Hour(time) {
  if (!time) return "";

  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;

  const isAM = hour < 12;
  const period = isAM ? "오전" : "오후";

  hour = hour % 12 || 12;

  return `${period} ${hour}:${minute}`;
}