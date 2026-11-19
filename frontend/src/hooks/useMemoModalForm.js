import { useEffect, useState } from "react";
import { setDateByPeriod } from "../util/dateUtil";
import { getDefaultMemoTimes } from "../util/timeUtil";
import { DEFAULT_COLOR_ID } from "../util/util";

export function useMemoModalForm({
  mode,
  memo,
  selectedDate,
  isOpen,
  selectedPeriod,
}) {
  // 날짜
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [showStartDateSelect, setShowStartDateSelect] = useState(false);
  const [showEndDateSelect, setShowEndDateSelect] = useState(false);

  // 시간
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:30");

  // 내용
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState(false);
  const [dateTimeError, setDateTimeError] = useState(false);

  // 팔레트
  const [selectedColorId, setSelectedColorId] = useState(DEFAULT_COLOR_ID);

  useEffect(() => {
    setShowStartDateSelect(false);
    setShowEndDateSelect(false);
    if (!isOpen) return;
    setContentError(false);
    setDateTimeError(false);
    if (mode === "create") {
      const { startDate, endDate } = setDateByPeriod(
        selectedPeriod,
        selectedDate
      );
      setStartDate(startDate);
      setEndDate(endDate);
      const defaultTimes = getDefaultMemoTimes();
      setStartTime(defaultTimes.startTime);
      setEndTime(defaultTimes.endTime);
      setAllDay(true);
      setContent("");
      setSelectedColorId(DEFAULT_COLOR_ID);
    } else if (mode === "edit" && memo) {
      setStartDate(memo.startDate);
      setEndDate(memo.endDate);
      setStartTime((memo.startTime || "12:00").substring(0, 5));
      setEndTime((memo.endTime || "12:30").substring(0, 5));
      setAllDay(memo.allday);
      setContent(memo.content);
      setSelectedColorId(memo.colorId);
    }
  }, [mode, isOpen, selectedDate, selectedPeriod, memo]);

  return {
    allDay,
    setAllDay,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showStartDateSelect,
    setShowStartDateSelect,
    showEndDateSelect,
    setShowEndDateSelect,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    content,
    setContent,
    contentError,
    setContentError,
    dateTimeError,
    setDateTimeError,
    selectedColorId,
    setSelectedColorId,
  };
}
