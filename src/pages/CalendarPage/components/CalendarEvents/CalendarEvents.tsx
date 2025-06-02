import { FC } from "react";
import "./CalendarEvents.css";
import { Event } from "@/lib/supabase/types/events";
import { formatTime, formatRelativeDate } from "@/utils/date-utils";

interface CalendarEventsProps {
  events: Event[];
  isLoading: boolean;
  selectedDate: Date;
}

// Компонент для отображения одного события
const EventItem: FC<{ event: Event }> = ({ event }) => {
  const startTime = formatTime(event.start_time);
  const endTime = event.end_time ? formatTime(event.end_time) : null;

  // Функция получения цвета в зависимости от типа события
  const getEventTypeColor = (difficultyLevel?: string) => {
    switch (difficultyLevel) {
      case "beginner":
        return "var(--calendar-event-practice)"; // Зеленый для начинающих
      case "intermediate":
        return "var(--calendar-event-broadcast)"; // Синий для среднего уровня
      case "advanced":
        return "var(--calendar-event-reminder)"; // Оранжевый для продвинутых
      default:
        return "var(--calendar-text-tertiary)"; // Серый для прочих типов
    }
  };

  // Перевод уровня сложности на русский
  const getDifficultyText = (difficultyLevel?: string) => {
    switch (difficultyLevel) {
      case "beginner":
        return "Начинающий";
      case "intermediate":
        return "Средний";
      case "advanced":
        return "Продвинутый";
      default:
        return "Практика";
    }
  };

  return (
    <div
      className="event-item"
      style={
        {
          "--event-color": getEventTypeColor(event.difficulty_level),
        } as React.CSSProperties
      }
    >
      <div className="event-item__time">{startTime}</div>
      <div className="event-item__content">
        <div className="event-item__title">{event.title}</div>
        <div className="event-item__details">
          <span className="event-item__type">
            {getDifficultyText(event.difficulty_level)}
          </span>
          <span className="event-item__duration">
            {startTime}{endTime ? ` – ${endTime}` : ''}
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
                duration: 45,
                difficulty_level: "beginner",
                event_date: selectedDate.toISOString().split("T")[0],
                start_time: "08:00:00",
                end_time: "08:45:00",
                is_premium: false,
                is_featured: false,
                is_recurring: false,
                event_status: "active" as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
            />
            <EventItem
              event={{
                id: "2",
                title: "Медитация осознанности",
                description: "Групповая медитация с инструктором",
                duration: 45,
                difficulty_level: "intermediate",
                event_date: selectedDate.toISOString().split("T")[0],
                start_time: "12:30:00",
                end_time: "13:15:00",
                is_premium: false,
                is_featured: false,
                is_recurring: false,
                event_status: "active" as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
            />
            <EventItem
              event={{
                id: "3",
                title: "Дыхательные практики",
                description: "Разбор различных техник для начинающих",
                duration: 60,
                difficulty_level: "advanced",
                event_date: selectedDate.toISOString().split("T")[0],
                start_time: "18:00:00",
                end_time: "19:00:00",
                is_premium: false,
                is_featured: false,
                is_recurring: false,
                event_status: "active" as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
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
