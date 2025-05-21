import { FC } from "react";
import "./CalendarEvents.css";
import { CalendarEvent } from "../../CalendarPage";
import { formatTime, formatRelativeDate } from "@/utils/date-utils";

interface CalendarEventsProps {
  events: CalendarEvent[];
  isLoading: boolean;
  selectedDate: Date;
}

// Компонент для отображения одного события
const EventItem: FC<{ event: CalendarEvent }> = ({ event }) => {
  const startTime = formatTime(event.start_time);
  const endTime = formatTime(event.end_time);

  // Функция получения цвета в зависимости от типа события
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "practice":
        return "var(--calendar-event-practice)"; // Зеленый для практик
      case "broadcast":
        return "var(--calendar-event-broadcast)"; // Синий для эфиров
      case "reminder":
        return "var(--calendar-event-reminder)"; // Оранжевый для напоминаний
      case "community":
        return "var(--calendar-event-community)"; // Фиолетовый для событий сообщества
      default:
        return "var(--calendar-text-tertiary)"; // Серый для прочих типов
    }
  };

  // Перевод типа события на русский
  const getEventTypeText = (type: string) => {
    switch (type) {
      case "practice":
        return "Практика";
      case "broadcast":
        return "Эфир";
      case "reminder":
        return "Напоминание";
      case "community":
        return "Событие сообщества";
      default:
        return "Событие";
    }
  };

  return (
    <div
      className="event-item"
      style={
        {
          "--event-color": getEventTypeColor(event.event_type),
        } as React.CSSProperties
      }
    >
      <div className="event-item__time">{startTime}</div>
      <div className="event-item__content">
        <div className="event-item__title">{event.title}</div>
        <div className="event-item__details">
          <span className="event-item__type">
            {getEventTypeText(event.event_type)}
          </span>
          <span className="event-item__duration">
            {startTime} – {endTime}
          </span>
        </div>
      </div>
      <button
        className="event-item__action-btn"
        aria-label="Подробнее о событии"
      >
        <svg
          width="24"
          height="24"
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
  );
};

// Основной компонент списка событий
const CalendarEvents: FC<CalendarEventsProps> = ({
  events,
  isLoading,
  selectedDate,
}) => {
  // Форматируем дату
  const formattedDate = formatRelativeDate(selectedDate);

  return (
    <div className="calendar-events">
      <div className="calendar-events__header">
        <h2 className="calendar-events__title">
          События на{" "}
          <span className="highlighted-date">
            {formattedDate.toLowerCase()}
          </span>
        </h2>
        <button
          className="calendar-events__add-btn"
          aria-label="Добавить событие"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="calendar-events__content">
        {isLoading ? (
          <div className="calendar-events__loading">
            <div className="spinner"></div>
            <p>Загрузка событий...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="calendar-events__empty">
            <div className="calendar-events__empty-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="16"
                  y1="2"
                  x2="16"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="8"
                  y1="2"
                  x2="8"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="3"
                  y1="10"
                  x2="21"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="calendar-events__empty-text">
              На этот день нет запланированных событий
            </div>
            <button className="calendar-events__add-event-btn">
              Добавить событие
            </button>
          </div>
        ) : (
          <div className="calendar-events__list">
            {/* Добавим демо-события для проверки дизайна */}
            <EventItem
              event={{
                id: "1",
                title: "Утренняя йога",
                description: "Мягкая практика для начала дня",
                event_type: "practice",
                start_time: `${selectedDate.toISOString().split("T")[0]}T08:00:00`,
                end_time: `${selectedDate.toISOString().split("T")[0]}T08:45:00`,
                thumbnail_url: "",
              }}
            />
            <EventItem
              event={{
                id: "2",
                title: "Медитация осознанности",
                description: "Групповая медитация с инструктором",
                event_type: "broadcast",
                start_time: `${selectedDate.toISOString().split("T")[0]}T12:30:00`,
                end_time: `${selectedDate.toISOString().split("T")[0]}T13:15:00`,
                thumbnail_url: "",
              }}
            />
            <EventItem
              event={{
                id: "3",
                title: "Дыхательные практики",
                description: "Разбор различных техник для начинающих",
                event_type: "community",
                start_time: `${selectedDate.toISOString().split("T")[0]}T18:00:00`,
                end_time: `${selectedDate.toISOString().split("T")[0]}T19:00:00`,
                thumbnail_url: "",
              }}
            />
            {/* Здесь будут реальные события из БД */}
            {events.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarEvents;
