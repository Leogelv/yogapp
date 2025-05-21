import React from "react";
import { useNavigate } from "react-router-dom";
import "./CalendarEvents.css";
import { CalendarEvent } from "../CalendarPage";

interface CalendarEventsProps {
  events: CalendarEvent[];
  isLoading: boolean;
  selectedDate: Date;
}

const CalendarEvents: React.FC<CalendarEventsProps> = ({
  events,
  isLoading,
  selectedDate,
}) => {
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Выберите дату";

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };

    return date.toLocaleDateString("ru-RU", options);
  };

  // Format time for display (HH:MM)
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get color based on event type
  const getEventColor = (eventType: string, defaultColor?: string) => {
    if (defaultColor) return defaultColor;

    switch (eventType) {
      case "practice":
        return "#4caf50"; // Green
      case "broadcast":
        return "#2196f3"; // Blue
      case "reminder":
        return "#ff9800"; // Orange
      case "community":
        return "#9c27b0"; // Purple
      default:
        return "#757575"; // Gray
    }
  };

  // Handle click on event to navigate to practice
  const handleEventClick = (event: CalendarEvent) => {
    if (event.content_id) {
      navigate(`/practice/${event.content_id}/video`);
    }
  };

  return (
    <div className="calendar-events">
      <h3 className="selected-date">{formatDate(selectedDate)}</h3>

      {isLoading ? (
        <div className="events-loading">Загрузка...</div>
      ) : events.length > 0 ? (
        <div className="events-list">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-item"
              onClick={() => handleEventClick(event)}
            >
              <div className="event-time">{formatTime(event.start_time)}</div>
              <div
                className="event-category-marker"
                style={{
                  backgroundColor: getEventColor(event.event_type, event.color),
                }}
              ></div>
              <div className="event-details">
                <div className="event-title">{event.title}</div>
                <div className="event-category">
                  {event.event_type === "practice"
                    ? "Практика"
                    : event.event_type === "broadcast"
                      ? "Трансляция"
                      : event.event_type === "reminder"
                        ? "Напоминание"
                        : "Сообщество"}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-events">
          <p>Нет запланированных практик на этот день</p>
          <button
            className="add-practice-button"
            onClick={() => navigate("/library")}
          >
            Добавить практику
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarEvents;
