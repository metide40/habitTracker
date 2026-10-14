import { useMemo } from 'react';
import { subDays, startOfDay } from 'date-fns';
import { toISODate, isHabitScheduledOn } from '../../utils/dates';

export function Sparkline({ habit, completions, days = 30 }) {
  const today = startOfDay(new Date());

  const points = useMemo(() => {
    const raw = [];
    for (let i = days + 5; i >= 0; i--) {
      const day = subDays(today, i);
      const scheduled = isHabitScheduledOn(habit, day);
      const done = scheduled && (completions[habit.id] || []).includes(toISODate(day));
      raw.push({ s: scheduled ? 1 : 0, d: done ? 1 : 0 });
    }
    // 7-day rolling completion rate -> smooth trend instead of a 0/1 square wave
    return raw.slice(6).map((_, i) => {
      const win = raw.slice(i, i + 7);
      const s = win.reduce((a, x) => a + x.s, 0);
      return s ? win.reduce((a, x) => a + x.d, 0) / s : 0;
    });
  }, [habit, completions, days]);

  const w = 88;
  const h = 24;
  const step = w / (points.length - 1 || 1);

  const path = points
    .map((v, i) => {
      const x = i * step;
      const y = h - v * (h - 4) - 2;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="var(--color-primary)" opacity="0.1" />
      <path
        d={path}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
