import { useEffect, useState } from "react";
import { useColors } from "../context/ColorContext";

export function useMemoModalForm({ mode, memo, selectedDate, isOpen }) {
  // 날짜
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [showStartDateSelect, setShowStartDateSelect] = useState(false);
  const [showEndDateSelect, setShowEndDateSelect] = useState(false);
  
  // 시간
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:30");
  const [showStartTimeSelect, setShowStartTimeSelect] = useState(false);
  const [showEndTimeSelect, setShowEndTimeSelect] = useState(false);
  
  // 내용
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState(false);
  const [dateTimeError, setDateTimeError] = useState(false);
  
  // 팔레트
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState(10);
  const [selectedColor, setSelectedColor] = useState("#173836");
  const colors = useColors();

  useEffect(() => {
    if (mode === "create") {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
      setStartTime("00:00");
      setEndTime("00:30");
      setAllDay(true);
      setContent("");
      setSelectedColorId(10);
      setSelectedColor("#173836");
    } else if (mode === "edit" && memo) {
      setStartDate(memo.startDate);
      setEndDate(memo.endDate);
      setStartTime((memo.startTime || "00:00").substring(0, 5));
      setEndTime((memo.endTime || "00:30").substring(0, 5));
      setAllDay(memo.allday);
      setContent(memo.content);
      setSelectedColorId(memo.colorId);
      const selectedColor = colors.find((color) => color.id === memo.colorId);
      if (selectedColor) {
        setSelectedColor(selectedColor.hex);
      }
    }
  }, [mode, isOpen]);

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
    showStartTimeSelect,
    setShowStartTimeSelect,
    showEndTimeSelect,
    setShowEndTimeSelect,
    endTime,
    setEndTime,
    content,
    setContent,
    contentError,
    setContentError,
    dateTimeError,
    setDateTimeError,
    isPaletteOpen,
    setIsPaletteOpen,
    selectedColorId,
    setSelectedColorId,
    selectedColor,
    setSelectedColor,
  };
}
