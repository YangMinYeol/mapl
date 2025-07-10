import { format, isSameDay, isToday } from "date-fns";
import { useEffect, useState } from "react";
import { fetchMultipleMonthsHolidays } from "../../api/holiday";
import { LINKED_MEMO } from "../../constants/messages";
import { useModal } from "../../context/ModalContext";
import {
  getDateKey,
  getDateTextColor,
  getTagMaxCount,
  getWeekDates,
} from "../../util/calendarUtil";
import { MEMO_MODAL_MODE } from "../../util/memoUtil";
import Loading from "../common/Loading";
import MemoModal from "../memo/MemoModal";
import MemoTag from "./MemoTag";
import { buildMemoLevelMap } from "../../util/memoTagUtil";
import { TAG_TYPE } from "../../constants/tag";

export default function CalendarDate({
  currentDate,
  selectedDate,
  setSelectedDate,
  calendarDatas,
  loadDashboardDatas,
  loadCalendarDatas,
  periods,
  setSelectedPeriod,
}) {
  const weeks = getWeekDates(currentDate);
  const tagMaxCount = getTagMaxCount(weeks);
  const [holidays, setHolidays] = useState([]);
  const memoLevelMap = buildMemoLevelMap(
    weeks,
    calendarDatas,
    tagMaxCount,
    holidays
  );
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const { openConfirm } = useModal();

  // 공휴일 데이터 fetch
  useEffect(() => {
    const loadHolidays = async () => {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await fetchMultipleMonthsHolidays(year, month);
      setHolidays(data);
      setIsLoading(false);
    };
    loadHolidays();
  }, [currentDate]);

  // 메모 클릭 시 동작
  function handleMemoClick(memo) {
    if (memo.type === TAG_TYPE.MORE || memo.type === TAG_TYPE.HOLIDAY) return;

    if (memo.isLinked) {
      openConfirm(LINKED_MEMO.TITLE, LINKED_MEMO.EDIT_CONFIRM, async () => {
        setSelectedMemo(memo);
        setIsMemoModalOpen(true);
      });
    } else {
      setSelectedMemo(memo);
      setIsMemoModalOpen(true);
    }
  }

  function handleDateClick(date) {
    setSelectedDate(date);
    setSelectedPeriod(periods[0]);
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div
      className={`grid flex-1 grid-rows-${weeks.length} gap-[1px] bg-gray-200 h-[820px]`}
    >
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((date, dateIndex) => {
            const key = getDateKey(date);
            const memoTags =
              memoLevelMap[key] ?? new Array(tagMaxCount).fill(null);

            return (
              <div
                key={dateIndex}
                className={`date-cell flex flex-col h-full ${
                  isSameDay(date, selectedDate)
                    ? "bg-gray-100"
                    : "hover:bg-gray-50 bg-white"
                }`}
                onClick={() => handleDateClick(date)}
              >
                {/* 날짜 */}
                <div
                  className={`flex items-center justify-center rounded-full w-[24px] h-[24px] date-label hover:cursor-default ${getDateTextColor(
                    date,
                    currentDate,
                    holidays
                  )} ${isToday(date) && "text-white bg-deep-green"}`}
                >
                  {format(date, "d")}
                </div>

                {/* 메모 태그 */}
                <div className="flex flex-col gap-[1px]">
                  {memoTags.map((memo, i) => (
                    <MemoTag
                      key={memo?.id ?? `placeholder-${i}`}
                      memo={memo}
                      date={date}
                      onClick={() => handleMemoClick(memo)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <MemoModal
        isOpen={isMemoModalOpen}
        onClose={() => {
          setIsMemoModalOpen(false);
          setSelectedMemo(null);
        }}
        selectedDate={selectedDate}
        mode={MEMO_MODAL_MODE.EDIT}
        memo={selectedMemo}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        selectedPeriod={periods[0]}
      />
    </div>
  );
}
