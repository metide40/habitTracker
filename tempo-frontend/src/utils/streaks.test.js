import { describe, it, expect } from 'vitest';
import { getCurrentStreak, getLongestStreak, getCompletionRate } from './streaks';
import { subDays, format, startOfDay } from 'date-fns';

const dailyHabit = {
  id: 'h1',
  frequency: { type: 'daily' },
};

const weekdayHabit = {
  id: 'h2',
  frequency: { type: 'weekdays', weekdays: [1, 2, 3, 4, 5] }, // Mon-Fri
};

function iso(d) {
  return format(startOfDay(d), 'yyyy-MM-dd');
}

describe('getCurrentStreak', () => {
  it('returns 0 when no completions', () => {
    expect(getCurrentStreak(dailyHabit, {})).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const today = startOfDay(new Date());
    const completions = {
      h1: [0, 1, 2].map((i) => iso(subDays(today, i))),
    };
    expect(getCurrentStreak(dailyHabit, completions, today)).toBe(3);
  });

  it('allows missing today if not yet done', () => {
    const today = startOfDay(new Date());
    const completions = {
      h1: [1, 2, 3].map((i) => iso(subDays(today, i))),
    };
    expect(getCurrentStreak(dailyHabit, completions, today)).toBe(3);
  });

  it('breaks on a missed scheduled day', () => {
    const today = startOfDay(new Date());
    const completions = {
      h1: [0, 1, 3].map((i) => iso(subDays(today, i))),
    };
    expect(getCurrentStreak(dailyHabit, completions, today)).toBe(2);
  });
});

describe('getLongestStreak', () => {
  it('returns 0 for empty', () => {
    expect(getLongestStreak(dailyHabit, {})).toBe(0);
  });

  it('finds longest run', () => {
    const base = startOfDay(new Date());
    const completions = {
      h1: [0, 1, 2, 5, 6].map((i) => iso(subDays(base, i))),
    };
    expect(getLongestStreak(dailyHabit, completions)).toBeGreaterThanOrEqual(2);
  });
});

describe('getCompletionRate', () => {
  it('returns 0 with no scheduled days done', () => {
    const end = startOfDay(new Date());
    const start = subDays(end, 6);
    expect(getCompletionRate(dailyHabit, {}, start, end)).toBe(0);
  });

  it('computes percentage correctly', () => {
    const end = startOfDay(new Date());
    const start = subDays(end, 3);
    const completions = {
      h1: [0, 1].map((i) => iso(subDays(end, i))),
    };
    // 4 days range (0..3), 2 done → 50%
    expect(getCompletionRate(dailyHabit, completions, start, end)).toBe(50);
  });
});
