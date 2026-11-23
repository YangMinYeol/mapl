import { format, isSameDay, isToday } from "date-fns";
import { useLayoutEffect, useRef } from "react";
import { TAG_TYPE } from "../../constants/tag";
import { getDateKey, getDateTextColor } from "../../util/calendarUtil";

export default function CalendarDate({
  weeks,
  selectedDate,
  currentDate,
  holidays,
  tagMap,
  tagMaxCount,
  onTagCapacityChange,
  onDateClick,
  onTagClick,
  TagComponent,
  ModalComponent,
  modalProps,
  isModalOpen,
  closeModal,
}) {
  const firstTagArea = useRef(null);

  useLayoutEffect(() => {
    const area = firstTagArea.current;
    function measureCapacity() {
      const styles = getComputedStyle(area);
      const row = parseFloat(styles.getPropertyValue("--calendar-tag-height"));
      const gap = parseFloat(styles.getPropertyValue("--calendar-tag-gap"));
      const height = area.getBoundingClientRect().height;
      onTagCapacityChange(Math.max(1, Math.floor((height + gap) / (row + gap))));
    }

    measureCapacity();
    const observer = new ResizeObserver(measureCapacity);
    observer.observe(area);
    return () => observer.disconnect();
  }, [onTagCapacityChange]);

  return (
    <div
      className="grid flex-1 gap-[1px] bg-gray-200"
    >
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((date, dateIndex) => {
            const key = getDateKey(date);
            const tags = tagMap[key] ?? new Array(tagMaxCount).fill(null);

            return (
              <div
                key={dateIndex}
                data-selected={isSameDay(date, selectedDate) || undefined}
                className={`date-cell flex flex-col h-full ${
                  isSameDay(date, selectedDate)
                    ? "bg-gray-100"
                    : "hover:bg-gray-50 bg-white"
                }`}
                onClick={() => onDateClick(date)}
              >
                <button type="button"
                  aria-label={format(date, "yyyy년 M월 d일")}
                  aria-pressed={isSameDay(date, selectedDate)}
                  aria-current={isToday(date) ? "date" : undefined}
                  className={`flex items-center justify-center rounded-full w-[24px] h-[24px] date-label hover:cursor-default ${getDateTextColor(
                    date,
                    currentDate,
                    holidays
                  )}`}
                >
                  {format(date, "d")}
                </button>

                <div className="calendar-tag-area" ref={weekIndex === 0 && dateIndex === 0 ? firstTagArea : undefined}>
                  <div className="calendar-tag-slots">
                    {tags.map((tag, i) =>
                      tag?.type === TAG_TYPE.MORE ? (
                        <button
                          key={tag.id}
                          type="button"
                          className="calendar-more mx-1 px-1 h-5 truncate"
                          aria-label={`${format(date, "yyyy년 M월 d일")} 기록 더 보기 (${tag.content})`}
                          aria-controls="planner-dashboard"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDateClick(date);
                            if (window.matchMedia("(max-width: 1023.98px)").matches) {
                              document.getElementById("planner-dashboard")?.focus();
                            }
                          }}
                        >
                          {tag.content.replace(/개$/, "")}
                        </button>
                      ) : tag ? (
                        <TagComponent
                          key={tag.id}
                          tag={tag}
                          date={date}
                          onClick={() => onTagClick(tag)}
                        />
                      ) : (
                        <div key={`placeholder-${i}`} className="h-5 px-1 mx-1" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <ModalComponent
        isOpen={isModalOpen}
        onClose={closeModal}
        {...modalProps}
      />
    </div>
  );
}
