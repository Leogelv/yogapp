import { FC, useMemo } from "react";
import "./CalendarGrid.css";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getDayName,
  isSameDay,
  isToday,
} from "@/utils/date-utils";

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarGrid: FC<CalendarGridProps> = ({
  currentMonth,
  selectedDate,
  onDateSelect,
}) => {
  // Массив с названиями дней недели (ПН-ВС)
  const weekdays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      // Создаем дату для каждого дня недели (используем 2023-01-02 как понедельник)
      const day = new Date(2023, 0, i + 1); // i+1 т.к. в JS неделя начинается с воскресенья (0)
      days.push(getDayName(day, "short"));
    }
    return days;
  }, []);

  // Получаем все дни текущего месяца
  const daysInMonth = useMemo(
    () => getDaysInMonth(currentMonth),
    [currentMonth],
  );

  // Получаем первый день месяца и его день недели
  const firstDayOfMonth = useMemo(
    () => getFirstDayOfMonth(currentMonth),
    [currentMonth],
  );
  const firstDayOfWeek =
    firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay(); // Корректировка для русской локали (ПН=1, ВС=7)

  // Создаем сетку календаря с пустыми ячейками в начале
  const calendarGrid = useMemo(() => {
    const grid = [];

    // Добавляем пустые ячейки в начале для выравнивания по дням недели
    for (let i = 1; i < firstDayOfWeek; i++) {
      grid.push(null);
    }

    // Добавляем все дни месяца
    grid.push(...daysInMonth);

    return grid;
  }, [daysInMonth, firstDayOfWeek]);

  // Обработчик выбора даты
  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  return (
    <div className="calendar-grid">
      {/* Дни недели */}
      <div className="calendar-grid__weekdays">
        {weekdays.map((day, index) => (
          <div key={index} className="calendar-grid__weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Сетка дней */}
      <div className="calendar-grid__days">
        {calendarGrid.map((day, index) => (
          <div
            key={index}
            className={`calendar-grid__day-cell ${!day ? "calendar-grid__day-cell--empty" : ""}`}
          >
            {day && (
              <button
                className={`calendar-grid__day-button ${
                  isToday(day) ? "calendar-grid__day-button--today" : ""
                } ${
                  isSameDay(day, selectedDate)
                    ? "calendar-grid__day-button--selected"
                    : ""
                }`}
                onClick={() => handleDateClick(day)}
                aria-pressed={isSameDay(day, selectedDate)}
                aria-current={isToday(day) ? "date" : undefined}
              >
                {day.getDate()}
                {/* Здесь можно добавить индикатор событий */}
                {Math.random() > 0.7 && (
                  <span className="calendar-grid__event-indicator"></span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
