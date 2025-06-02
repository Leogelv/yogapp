import React from "react";
import { useNavigate } from "react-router-dom";
import "./CalendarEvents.css";
import { Event } from "@/lib/supabase/types/events";

interface CalendarEventsProps {
  events: Event[];
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
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Get color based on difficulty level
  const getEventColor = (difficultyLevel?: string) => {
    switch (difficultyLevel) {
      case "beginner":
        return "#4caf50"; // Green
      case "intermediate":
        return "#ff9800"; // Orange
      case "advanced":
        return "#f44336"; // Red
      default:
        return "#2196f3"; // Blue
    }
  };

  // Handle click on event to navigate to practice
  const handleEventClick = (event: Event) => {
    navigate(`/practice/event/${event.id}`);
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
                  backgroundColor: getEventColor(event.difficulty_level),
                }}
              ></div>
              <div className="event-details">
                <div className="event-title">{event.title}</div>
                <div className="event-category">
                  {event.categories?.name || "Практика"}
                </div>
                {event.instructor_name && (
                  <div className="event-instructor">{event.instructor_name}</div>
                )}
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
