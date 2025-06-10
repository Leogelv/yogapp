import { FC, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CalendarPage.css";
import { Page } from "@/components/Page";
import { supabase } from "@/lib/supabase/client";
import { Event } from "@/lib/supabase/types/events";
import { RealtimeChannel } from "@supabase/supabase-js";
export const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
        case 'practice':
            return 'практика';
        case 'broadcast':
            return 'эфир';
        case 'community':
            return 'сообщество';
        case 'reminder':
            return 'напоминание';
        default:
            return 'событие';
    }
};
const CalendarPage: FC = () => {
 const navigate = useNavigate();
  // Состояние календаря
 const [currentDate, setCurrentDate] = useState<Date>(new Date());
 const [selectedDate, setSelectedDate] = useState<Date>(new Date());
 const [events, setEvents] = useState<Event[]>([]);
 const [eventsForMonth, setEventsForMonth] = useState<Event[]>([]);
 const [isLoading, setIsLoading] = useState<boolean>(true);

 // Refs для realtime
 const channelRef = useRef<RealtimeChannel | null>(null);
 const lastUpdateTimeRef = useRef<number>(0);
 const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

 // Загрузка событий для текущего месяца (для отображения точек на календаре)
 useEffect(() => {
   const fetchMonthEvents = async () => {
     if (!supabase) return;

     const year = currentDate.getFullYear();
     const month = currentDate.getMonth();
     const firstDay = new Date(year, month, 1);
     const lastDay = new Date(year, month + 1, 0);

     try {
       const { data, error } = await supabase
         .from("events")
         .select("*")
         .gte("start_time", firstDay.toISOString())
         .lte("start_time", lastDay.toISOString())
         .order("start_time", { ascending: true });

       if (error) throw error;
       setEventsForMonth(data || []);
     } catch (err) {
       console.error("Failed to fetch month events:", err);
       setEventsForMonth([]);
     }
   };

   fetchMonthEvents();
 }, [currentDate]);

 // Загрузка событий для выбранной даты
 useEffect(() => {
   const fetchDayEvents = async () => {
     if (!supabase) return;

     setIsLoading(true);
     const startOfDay = new Date(selectedDate);
     startOfDay.setHours(0, 0, 0, 0);
     const endOfDay = new Date(selectedDate);
     endOfDay.setHours(23, 59, 59, 999);

     try {
       const { data, error } = await supabase
         .from("events")
         .select("*")
         .gte("start_time", startOfDay.toISOString())
         .lte("start_time", endOfDay.toISOString())
         .order("start_time", { ascending: true });

       if (error) throw error;
       setEvents(data || []);
     } catch (err) {
       console.error("Failed to fetch day events:", err);
       setEvents([]);
     } finally {
       setIsLoading(false);
     }
   };

   fetchDayEvents();
 }, [selectedDate]);

 // Realtime обновления
 useEffect(() => {
   if (!supabase) return;

   channelRef.current = supabase
     .channel("public:events")
     .on(
       "postgres_changes",
       { event: "*", schema: "public", table: "events" },
       () => {
         const now = Date.now();
         if (now - lastUpdateTimeRef.current < 200) return;

         if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

         debounceTimerRef.current = setTimeout(() => {
           // Перезагружаем события для текущего месяца и выбранного дня
           const year = currentDate.getFullYear();
           const month = currentDate.getMonth();
           const firstDay = new Date(year, month, 1);
           const lastDay = new Date(year, month + 1, 0);
          
           const fetchUpdatedEvents = async () => {
             if (!supabase) return;

             // Обновляем события месяца
             const { data: monthData } = await supabase
               .from("events")
               .select("*")
               .gte("start_time", firstDay.toISOString())
               .lte("start_time", lastDay.toISOString());

             setEventsForMonth(monthData || []);
             // Обновляем события дня если нужно
             const startOfDay = new Date(selectedDate);
             startOfDay.setHours(0, 0, 0, 0);
             const endOfDay = new Date(selectedDate);
             endOfDay.setHours(23, 59, 59, 999);
            
             const { data: dayData } = await supabase
               .from("events")
               .select("*")
               .gte("start_time", startOfDay.toISOString())
               .lte("start_time", endOfDay.toISOString())
               .order("start_time", { ascending: true });

             setEvents(dayData || []);
           };

           fetchUpdatedEvents();
           debounceTimerRef.current = null;
         }, 300);

         lastUpdateTimeRef.current = now;
       }
     )
     .subscribe();

   return () => {
     if (channelRef.current) channelRef.current.unsubscribe();
     if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
   };
 }, [currentDate, selectedDate]);

 // Функции для работы с календарем
 const getDaysInMonth = (date: Date) => {
   const year = date.getFullYear();
   const month = date.getMonth();
   const firstDay = new Date(year, month, 1);
   const lastDay = new Date(year, month + 1, 0);
   const daysInMonth = lastDay.getDate();
   const startingDayOfWeek = firstDay.getDay();

   const days: Date[] = [];

   // Добавляем пустые дни в начале месяца
   for (let i = 0; i < startingDayOfWeek; i++) {
     days.push(new Date(year, month, -startingDayOfWeek + i + 1));
   }

   // Добавляем дни текущего месяца
   for (let day = 1; day <= daysInMonth; day++) {
     days.push(new Date(year, month, day));
   }

   return days;
 };

 const isDateSelected = (date: Date) => {
   return (
     date.toDateString() === selectedDate.toDateString()
   );
 };

 const hasEvents = (date: Date) => {
   const startOfDay = new Date(date);
   startOfDay.setHours(0, 0, 0, 0);
   const endOfDay = new Date(date);
   endOfDay.setHours(23, 59, 59, 999);
  
   return eventsForMonth.some(event => {
     const eventDate = new Date(event.start_time);
     return eventDate >= startOfDay && eventDate <= endOfDay;
   });
 };

 const handlePrevMonth = () => {
   setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
 };

 const handleNextMonth = () => {
   setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
 };

 const handleDateClick = (date: Date) => {
   setSelectedDate(date);
 };

 const handleEventClick = (event: Event) => {
   // Переходим на плеер с event ID
   navigate(`/practice/event/${event.id}`);
 };

 const formatTime = (timeString: string) => {
   // Если это полная дата-время, извлекаем только время
   if (timeString.includes('T')) {
     const date = new Date(timeString);
     return date.toLocaleTimeString('ru-RU', {
       hour: '2-digit',
       minute: '2-digit',
       timeZone: 'Europe/Moscow'
     });
   }
   // Если это уже время в формате HH:MM:SS
   const [hours, minutes] = timeString.split(':');
   return `${hours}:${minutes}`;
 };

 const formatDate = (date: Date) => {
   const options: Intl.DateTimeFormatOptions = {
     weekday: 'short',
     day: 'numeric'
   };
   return date.toLocaleDateString('ru-RU', options);
 };



 const monthNames = [
   'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
 ];

 const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
 return (
   <Page back={false}>
     <div className="calendar-page">
       {/* Навигация по месяцам */}
         <div className={'flex items-center justify-between gap-4 !p-4'}>
             <p style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'font-bold text-2xl'}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
             <div className={'flex items-center'}>
                 <svg onClick={handlePrevMonth} width="24" height="24" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                     <path d="M15 19L8 12L15 5" stroke="#191919" stroke-width="2" stroke-linecap="round"
                           stroke-linejoin="round"/>
                 </svg>
                 <svg onClick={handleNextMonth} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M9 5L16 12L9 19" stroke="#191919" stroke-width="2" stroke-linecap="round"
                           stroke-linejoin="round"/>
                 </svg>
             </div>
         </div>


       {/* Календарная сетка */}
       <div className="calendar-grid">
         {/* Заголовки дней недели */}
         <div className="weekdays">
           {weekDays.map((day) => (
             <div key={day} className="weekday">{day}</div>
           ))}
         </div>

         {/* Дни месяца */}
         <div className="days-grid">
           {getDaysInMonth(currentDate).map((date, index) => {
             const isCurrentMonth = date.getMonth() === currentDate.getMonth();
             const isSelected = isDateSelected(date);
             const hasEventsOnDate = hasEvents(date);
             const isToday = date.toDateString() === new Date().toDateString();

             return (
                 <button
                     key={index}
                     className={`day-button ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                     onClick={() => handleDateClick(date)}
                     disabled={!isCurrentMonth}
                 >
                     <span className="day-number !mr-[1px]">{date.getDate()}</span>
                     <div className={`event-dot  !mt-[3px] ${hasEventsOnDate && 'active'}`}/>
                 </button>
             );
           })}
         </div>
       </div>

       {/* События выбранного дня */}
       <div className="events-section ">
         <h2 className="!px-3 text-xl font-bold text-[#191919]" style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }}>
           {formatDate(selectedDate)}
         </h2>

         {isLoading ? (
           <div className="events-loading">Загрузка событий...</div>
         ) : events.length === 0 ? (
           <div className="no-events">
             <p>На эту дату событий нет</p>
           </div>
         ) : (
           <div className="">
             {events.map((event) => (
               <div
                 key={event.id}
                 className="border-b border-black !py-4 !px-3 flex items-center gap-3"
                 onClick={() => handleEventClick(event)}
               >
                   <img className="w-[52px] h-[52px] object-cover" src={event.thumbnail_url || "/assets/images/favourites-card-bg.png" } alt={event.title}/>
                    <div className={'flex flex-col gap-3'}>
                        <h3 style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'font-bold text-xl'}>{event.title}</h3>
                        <div className={'flex items-center gap-3'}>
                            <div className={'text-sm !py-1 !px-2 text-white bg-[#414141] border border-[#191919]'}
                                 style={{fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em'}}>
                                {getEventTypeLabel(event.event_type)}
                            </div>
                            <div className={'text-sm !py-1 !px-2 text-white bg-[#414141] border border-[#191919]'}
                                 style={{fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em'}}>
                                {formatTime(event.start_time)} мск
                            </div>
                        </div>
                    </div>
               </div>
             ))}
           </div>
         )}
       </div>
     </div>
   </Page>
 );
};

export default CalendarPage;
