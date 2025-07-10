import { format, isSameDay, isToday } from "date-fns";
import { useEffect, useState } from "react";
import { fetchMultipleMonthsHolidays } from "../../api/holiday";
import { generateAccountBookTagMap } from "../../util/accountBookTagUtil";
import {
  ACCOUNTBOOK_MODAL_MODE,
  ACCOUNT_TYPE,
} from "../../util/accountBookUtil";
import {
  getDateKey,
  getDateTextColor,
  getTagMaxCount,
  getWeekDates,
} from "../../util/calendarUtil";
import AccountBookModal from "../account-book/AccountBookModal";
import Loading from "../common/Loading";
import AccountBookTag from "./AccountBookTag";

export default function AccountBookCalendarDate({
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
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [selectedItem, setselectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const tagDataMap = generateAccountBookTagMap(
    weeks,
    calendarDatas,
    holidays,
    tagMaxCount
  );

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

  // 모달 닫기
  function closeAccountBookModal() {
    setselectedItem(null);
    setIsDashboardModalOpen(false);
  }

  // 날짜 클릭
  function handleDateClick(date) {
    setSelectedDate(date);
    setSelectedPeriod(periods[0]);
  }

  // 태그 클릭
  function handleTagClick(tag) {
    const type = tag.type;
    if (type !== ACCOUNT_TYPE.EXPENSE && type !== ACCOUNT_TYPE.INCOME) return;
    setselectedItem(tag);
    setIsDashboardModalOpen(true);
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
            const tagDatas =
              tagDataMap[key] ?? new Array(tagMaxCount).fill(null);

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

                {/* 태그 */}
                <div className="flex flex-col gap-[1px]">
                  {tagDatas.map((tag, i) =>
                    tag ? (
                      <AccountBookTag
                        key={tag.id}
                        tag={tag}
                        onClick={() => handleTagClick(tag)}
                      />
                    ) : (
                      <div key={`placeholder-${i}`} className="h-5 px-1 mx-1" />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <AccountBookModal
        isOpen={isDashboardModalOpen}
        onClose={closeAccountBookModal}
        mode={ACCOUNTBOOK_MODAL_MODE.EDIT}
        selectedDate={selectedDate}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        item={selectedItem}
      />
    </div>
  );
}
