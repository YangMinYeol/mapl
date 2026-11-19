export function formatTimeTo12Hour(time) {
  if (!time) return "";

  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;

  const isAM = hour < 12;
  const period = isAM ? "오전" : "오후";

  const displayHour = hour % 12 || 12;

  return `${period} ${displayHour}:${minute}`;
}
const lastFiveMinuteSlot = 23 * 60 + 55;

function formatClockMinutes(minutes) {
  const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function getDefaultMemoTimes(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes()
    + now.getSeconds() / 60 + now.getMilliseconds() / 60000;
  const start = Math.min(lastFiveMinuteSlot, Math.ceil(minutes / 5) * 5);
  return {
    startTime: formatClockMinutes(start),
    endTime: formatClockMinutes(Math.min(lastFiveMinuteSlot, start + 30)),
  };
}

export function getDefaultTransactionTime(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return formatClockMinutes(Math.floor(minutes / 5) * 5);
}
