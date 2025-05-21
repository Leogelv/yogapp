import { FC, useState, useEffect, useRef } from "react";
import "./CalendarPage.css";
import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";
import CalendarEvents from "./components/CalendarEvents";
import { Page } from "@/components/Page";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/utils/date-utils";
import { RealtimeChannel } from "@supabase/supabase-js";

// Определение интерфейса для событий календаря
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_type: "practice" | "broadcast" | "reminder" | "community";
  start_time: string;
  end_time: string;
  content_id?: string;
  thumbnail_url?: string;
  color?: string;
}

const CalendarPage: FC = () => {
  // Состояние для текущей выбранной даты и месяца
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Состояние для событий
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contentVisible, setContentVisible] = useState<boolean>(false);

  // Refs для realtime обновлений
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Анимируем появление контента
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Переключение месяца
  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  // Выбор даты
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Загрузка событий при изменении выбранной даты
  useEffect(() => {
    const fetchEvents = async () => {
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return;
      }

      setIsLoading(true);
      const formattedDate = formatDate(selectedDate, "yyyy-MM-dd");

      try {
        // Запрос событий на выбранную дату
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .gte("start_time", `${formattedDate}T00:00:00`)
          .lt("start_time", `${formattedDate}T23:59:59`)
          .order("start_time", { ascending: true });

        if (error) {
          console.error("Error fetching events:", error);
          setEvents([]);
        } else {
          setEvents(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate]);

  // Настраиваем realtime обновления для событий
  useEffect(() => {
    if (!supabase) {
      console.error("Supabase client is not initialized");
      return;
    }

    // Подписываемся на изменения в таблице events
    channelRef.current = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload: any) => {
          const now = Date.now();
          // Игнорируем обновления в течение 200мс чтобы избежать дублирования
          if (now - lastUpdateTimeRef.current < 200) return;

          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

          // Дебаунсим обновление UI
          debounceTimerRef.current = setTimeout(() => {
            // Обновляем данные только если текущая дата совпадает с датой события
            if (payload.new && payload.new.start_time) {
              const eventDate = new Date(payload.new.start_time).toDateString();
              const currentSelectedDate = selectedDate.toDateString();

              if (eventDate === currentSelectedDate) {
                // Перезагружаем события
                const fetchEvents = async () => {
                  if (!supabase) return;

                  const formattedDate = formatDate(selectedDate, "yyyy-MM-dd");

                  const { data } = await supabase
                    .from("events")
                    .select("*")
                    .gte("start_time", `${formattedDate}T00:00:00`)
                    .lt("start_time", `${formattedDate}T23:59:59`)
                    .order("start_time", { ascending: true });

                  setEvents(data || []);
                };

                fetchEvents();
              }
            }

            debounceTimerRef.current = null;
          }, 300);

          lastUpdateTimeRef.current = now;
        },
      )
      .subscribe();

    // Отписываемся при размонтировании компонента
    return () => {
      if (channelRef.current) channelRef.current.unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [selectedDate]);

  return (
    <Page>
      <div
        className={`calendar-container ${contentVisible ? "content-visible" : ""}`}
      >
        <CalendarHeader
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
        />

        <CalendarGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />

        <CalendarEvents
          events={events}
          isLoading={isLoading}
          selectedDate={selectedDate}
        />
      </div>
    </Page>
  );
};

export default CalendarPage;
