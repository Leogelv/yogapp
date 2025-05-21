import { FC } from "react";
import { getMonthName } from "@/utils/date-utils";
import "./CalendarHeader.css";

interface CalendarHeaderProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
}

const CalendarHeader: FC<CalendarHeaderProps> = ({
  currentMonth,
  onMonthChange,
}) => {
  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  const handleToday = () => {
    onMonthChange(new Date());
  };

  const monthName = getMonthName(currentMonth);
  const year = currentMonth.getFullYear();
  const isCurrentMonth =
    new Date().getMonth() === currentMonth.getMonth() &&
    new Date().getFullYear() === currentMonth.getFullYear();

  return (
    <div className="calendar-header">
      <h1 className="calendar-header__title">Календарь</h1>

      <div className="calendar-header__controls">
        <button
          className="calendar-header__arrow-btn"
          onClick={handlePreviousMonth}
          aria-label="Предыдущий месяц"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="calendar-header__current-month">
          <span className="month-name">{monthName}</span>
          <span className="year-number">{year}</span>
        </div>

        <button
          className="calendar-header__arrow-btn"
          onClick={handleNextMonth}
          aria-label="Следующий месяц"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {!isCurrentMonth && (
        <button
          className="calendar-header__today-btn"
          onClick={handleToday}
          aria-label="Сегодня"
        >
          Сегодня
        </button>
      )}
    </div>
  );
};

export default CalendarHeader;
