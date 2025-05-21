import React from "react";
import "./CalendarGrid.css";

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  selectedDate,
  onDateSelect,
}) => {
  // Get days for the current month view
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week (0-6) for the first day of the month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay() || 7; // Adjust Sunday from 0 to 7
  };

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const today = new Date();

    // Day names
    const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

    // Calendar grid cells
    const days = [];

    // Add day names header
    const dayNamesRow = (
      <div className="calendar-days-header" key="days-header">
        {dayNames.map((day) => (
          <div className="day-name" key={day}>
            {day}
          </div>
        ))}
      </div>
    );
    days.push(dayNamesRow);

    // Create calendar grid
    let dayCount = 1;
    const rows = [];
    let cells = [];

    // Add empty cells for days before the first day of month
    for (let i = 1; i < firstDayOfMonth; i++) {
      cells.push(<div className="calendar-day empty" key={`empty-${i}`}></div>);
    }

    // Add days of the month
    while (dayCount <= daysInMonth) {
      const isToday =
        today.getDate() === dayCount &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      const isSelected =
        selectedDate &&
        selectedDate.getDate() === dayCount &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      cells.push(
        <div
          className={`calendar-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
          key={dayCount}
          onClick={() => onDateSelect(new Date(year, month, dayCount))}
        >
          <span className="day-number">{dayCount}</span>
        </div>,
      );

      // Start a new row after every 7 cells
      if (
        (firstDayOfMonth - 1 + dayCount) % 7 === 0 ||
        dayCount === daysInMonth
      ) {
        rows.push(
          <div className="calendar-week" key={`week-${rows.length}`}>
            {cells}
          </div>,
        );
        cells = [];
      }

      dayCount++;
    }

    days.push(...rows);
    return days;
  };

  return <div className="calendar-grid">{renderCalendarDays()}</div>;
};

export default CalendarGrid;
