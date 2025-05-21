/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date to a localized string (DD.MM.YYYY) or custom format
 * @param date The date to format
 * @param format Optional format string:
 *   - 'yyyy-MM-dd' - ISO date format (2023-05-21)
 *   - 'dd.MM.yyyy' - Russian date format (21.05.2023)
 *   - undefined - uses Russian locale format (default)
 */
export const formatDate = (date: Date | string | number, format?: string): string => {
  const d = new Date(date);
  
  if (!format) {
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  // Custom format patterns
  switch (format) {
    case 'yyyy-MM-dd':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    case 'dd.MM.yyyy':
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    default:
      return d.toLocaleDateString('ru-RU');
  }
};

/**
 * Format a date to a short format (DD MMM)
 */
export const formatShortDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  });
};

/**
 * Format time from Date (HH:MM)
 */
export const formatTime = (date: Date | string | number): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Convert minutes to a formatted string (HH:MM)
 */
export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Format duration in minutes to human-readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} мин`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  }
};

/**
 * Get the current date at midnight (start of day)
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the date for the end of day (23:59:59.999)
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Calculate the difference in days between two dates
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if the date is yesterday
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Create an array of dates for a date range
 */
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Check if a date is within a specified range
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

/**
 * Format relative time (today, yesterday, or date)
 */
export const formatRelativeDate = (date: Date | string | number): string => {
  const d = new Date(date);
  
  if (isToday(d)) {
    return 'Сегодня';
  } else if (isYesterday(d)) {
    return 'Вчера';
  } else {
    return formatDate(d);
  }
};

/**
 * Get the month name in Russian
 */
export const getMonthName = (date: Date, format: 'long' | 'short' = 'long'): string => {
  return date.toLocaleDateString('ru-RU', { month: format });
};

/**
 * Get the first day of the month
 */
export const getFirstDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get the last day of the month
 */
export const getLastDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Get all days in month as an array of Date objects
 */
export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
};

/**
 * Get the day name in Russian
 */
export const getDayName = (date: Date, format: 'long' | 'short' = 'short'): string => {
  return date.toLocaleDateString('ru-RU', { weekday: format });
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};