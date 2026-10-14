import {
  format,
  startOfDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subDays,
  isSameDay,
  parseISO,
  isValid,
  getDay,
} from 'date-fns';

export function toISODate(date = new Date()) {
  return format(startOfDay(date), 'yyyy-MM-dd');
}

export function parseDate(iso) {
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  return isValid(d) ? d : new Date();
}

export function formatDisplayDate(date = new Date()) {
  return format(date, 'EEEE, d MMMM');
}

export function formatShortDate(date = new Date()) {
  return format(date, 'MMM d');
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getWeekDays(weekStartsOn = 1, reference = new Date()) {
  const start = startOfWeek(reference, { weekStartsOn });
  const end = endOfWeek(reference, { weekStartsOn });
  return eachDayOfInterval({ start, end });
}

export function getLastNDays(n, reference = new Date()) {
  const end = startOfDay(reference);
  const start = subDays(end, n - 1);
  return eachDayOfInterval({ start, end });
}

export function isHabitScheduledOn(habit, date) {
  if (!habit.frequency || habit.frequency.type === 'daily') return true;
  const dayIndex = getDay(date); // 0=Sun
  return (habit.frequency.weekdays || []).includes(dayIndex);
}

export function getDaysInRange(start, end) {
  return eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) });
}

export { format, isSameDay, subDays, startOfDay, parseISO };
