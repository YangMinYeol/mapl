import { useState } from "react";
import useHolidayData from "../../hooks/useHolidayData";
import { generateAccountBookTagMap } from "../../util/accountBookTagUtil";
import {
  ACCOUNTBOOK_MODAL_MODE,
  ACCOUNT_TYPE,
} from "../../util/accountBookUtil";
import {
  getTagMaxCount,
  getWeekDates,
  handleDateClick,
} from "../../util/calendarUtil";
import AccountBookModal from "../account-book/AccountBookModal";
import Loading from "../common/Loading";
import AccountBookTag from "./AccountBookTag";
import CalendarDate from "./CalendarDate";

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { holidays, isLoading } = useHolidayData(currentDate);
  const tagMap = generateAccountBookTagMap(
    weeks,
    calendarDatas,
    holidays,
    tagMaxCount
  );

  function handleTagClick(tag) {
    const type = tag.type;
    if (type !== ACCOUNT_TYPE.EXPENSE && type !== ACCOUNT_TYPE.INCOME) return;
    setSelectedItem(tag);
    setIsModalOpen(true);
  }

  if (isLoading) return <Loading />;

  return (
    <CalendarDate
      weeks={weeks}
      selectedDate={selectedDate}
      currentDate={currentDate}
      holidays={holidays}
      tagMap={tagMap}
      tagMaxCount={tagMaxCount}
      onDateClick={(date) =>
        handleDateClick(date, setSelectedDate, setSelectedPeriod, periods)
      }
      onTagClick={handleTagClick}
      TagComponent={AccountBookTag}
      ModalComponent={AccountBookModal}
      modalProps={{
        selectedDate,
        item: selectedItem,
        mode: ACCOUNTBOOK_MODAL_MODE.EDIT,
        loadDashboardDatas,
        loadCalendarDatas,
      }}
      isModalOpen={isModalOpen}
      closeModal={() => {
        setSelectedItem(null);
        setIsModalOpen(false);
      }}
    />
  );
}
