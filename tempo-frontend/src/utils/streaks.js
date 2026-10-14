import { subDays, startOfDay } from 'date-fns';
import { toISODate, isHabitScheduledOn, parseDate } from './dates';

/**
 * Get current streak for a habit ending today (or most recent completion).
 * Only counts scheduled days.
 */
export function getCurrentStreak(habit, completions, today = new Date()) {
  const key = habit.id;
  const completedSet = new Set(
    (completions[key] || []).map((c) => (typeof c === 'string' ? c : c.date))
  );

  let streak = 0;
  let cursor = startOfDay(today);

  // If today is scheduled and not done, start from yesterday
  if (isHabitScheduledOn(habit, cursor) && !completedSet.has(toISODate(cursor))) {
    cursor = subDays(cursor, 1);
  }

  // Walk backwards
  for (let i = 0; i < 400; i++) {
    if (!isHabitScheduledOn(habit, cursor)) {
      cursor = subDays(cursor, 1);
      continue;
    }
    const iso = toISODate(cursor);
    if (completedSet.has(iso)) {
      streak += 1;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Longest consecutive scheduled-day streak in completion history.
 */
export function getLongestStreak(habit, completions) {
  const dates = (completions[habit.id] || [])
    .map((c) => (typeof c === 'string' ? c : c.date))
    .sort();

  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = parseDate(dates[i - 1]);
    const curr = parseDate(dates[i]);
    // Count gap of non-scheduled days
    let gap = 0;
    let walker = subDays(curr, 1);
    let scheduledGap = 0;
    while (walker > prev && scheduledGap < 2) {
      if (isHabitScheduledOn(habit, walker)) {
        scheduledGap += 1;
      }
      walker = subDays(walker, 1);
      gap += 1;
      if (gap > 30) break;
    }

    if (scheduledGap === 0) {
      // consecutive scheduled days (no missed scheduled day between)
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

/**
 * Completion rate over a date range for scheduled days only.
 */
export function getCompletionRate(habit, completions, startDate, endDate) {
  const completedSet = new Set(
    (completions[habit.id] || []).map((c) => (typeof c === 'string' ? c : c.date))
  );

  let scheduled = 0;
  let done = 0;
  let cursor = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (cursor <= end) {
    if (isHabitScheduledOn(habit, cursor)) {
      scheduled += 1;
      if (completedSet.has(toISODate(cursor))) done += 1;
    }
    cursor = subDays(cursor, -1); // add 1 day
  }

  if (scheduled === 0) return 0;
  return Math.round((done / scheduled) * 100);
}

/**
 * Daily completion counts across all active habits for a range.
 */
export function getDailyCompletionCounts(habits, completions, days) {
  return days.map((day) => {
    const iso = toISODate(day);
    let scheduled = 0;
    let done = 0;
    habits
      .filter((h) => !h.archived)
      .forEach((habit) => {
        if (isHabitScheduledOn(habit, day)) {
          scheduled += 1;
          const list = completions[habit.id] || [];
          if (list.some((c) => (typeof c === 'string' ? c : c.date) === iso)) {
            done += 1;
          }
        }
      });
    return { date: iso, day, scheduled, done, rate: scheduled ? done / scheduled : 0 };
  });
}

/**
 * Heatmap intensity 0-4 based on completion rate that day.
 */
export function getHeatmapLevel(rate) {
  if (rate <= 0) return 0;
  if (rate < 0.25) return 1;
  if (rate < 0.5) return 2;
  if (rate < 0.75) return 3;
  return 4;
}
