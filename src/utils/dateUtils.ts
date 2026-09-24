/**
 * Get the start of the current week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust for Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the end of the current week (Sunday)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/**
 * Get the start of a specific week (0 = this week, -1 = last week, etc)
 */
export function getWeekStartByOffset(offset: number): Date {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const targetDate = new Date(weekStart);
  targetDate.setDate(targetDate.getDate() + offset * 7);
  return targetDate;
}

/**
 * Format date as "Sep 24, 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

/**
 * Format date as "Sep 24"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

/**
 * Format date and time as "Sep 24, 2026 at 2:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) +
         ' at ' +
         d.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
}

/**
 * Get a human-readable relative date string
 * e.g., "Today", "Yesterday", "2 days ago", "Sep 24"
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  }

  if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  }

  const daysAgo = Math.floor((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));
  if (daysAgo > 0 && daysAgo <= 6) {
    return `${daysAgo} days ago`;
  }

  return formatDateShort(d);
}

/**
 * Check if a date is in the current week
 */
export function isInCurrentWeek(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  return d >= weekStart && d <= weekEnd;
}

/**
 * Get week label for a given week number
 * e.g., "Sep 1–7", "Sep 8–14"
 */
export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const samMonth = weekStart.getMonth() === weekEnd.getMonth();
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();

  if (samMonth && sameYear) {
    return `${formatDateShort(weekStart)}–${weekEnd.getDate()}`;
  } else if (sameYear) {
    return `${formatDateShort(weekStart)}–${formatDateShort(weekEnd)}`;
  } else {
    return `${formatDate(weekStart)}–${formatDate(weekEnd)}`;
  }
}

/**
 * Get the last N weeks of data (for historical progress view)
 */
export function formatHomeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dayName = d.toLocaleDateString('en-US', {weekday: 'long'}).toUpperCase();
  const monthName = d.toLocaleDateString('en-US', {month: 'long'}).toUpperCase();
  const day = d.getDate();
  return `${dayName}, ${monthName} ${day}`;
}
export function getLastNWeeks(n: number): Array<{start: Date; end: Date; label: string}> {
  const weeks: Array<{start: Date; end: Date; label: string}> = [];

  for (let i = n - 1; i >= 0; i--) {
    const start = getWeekStartByOffset(-i);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    weeks.push({
      start,
      end,
      label: formatWeekLabel(start),
    });
  }

  return weeks;
}
