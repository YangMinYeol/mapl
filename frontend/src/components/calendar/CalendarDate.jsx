import { format, isSameDay, isToday } from "date-fns";
import { getDateKey, getDateTextColor } from "../../util/calendarUtil";

export default function CalendarDate({
  weeks,
  selectedDate,
  currentDate,
  holidays,
  tagMap,
  tagMaxCount,
  onDateClick,
  onTagClick,
  TagComponent,
  ModalComponent,
  modalProps,
  isModalOpen,
  closeModal,
}) {
  return (
    <div
      className={`grid flex-1 grid-rows-${weeks.length} gap-[1px] bg-gray-200 h-[820px]`}
    >
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((date, dateIndex) => {
            const key = getDateKey(date);
            const tags = tagMap[key] ?? new Array(tagMaxCount).fill(null);

            return (
              <div
                key={dateIndex}
                className={`date-cell flex flex-col h-full ${
                  isSameDay(date, selectedDate)
                    ? "bg-gray-100"
                    : "hover:bg-gray-50 bg-white"
                }`}
                onClick={() => onDateClick(date)}
              >
                <div
                  className={`flex items-center justify-center rounded-full w-[24px] h-[24px] date-label hover:cursor-default ${getDateTextColor(
                    date,
                    currentDate,
                    holidays
                  )} ${isToday(date) && "text-white bg-deep-green"}`}
                >
                  {format(date, "d")}
                </div>

                <div className="flex flex-col gap-[1px]">
                  {tags.map((tag, i) =>
                    tag ? (
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
