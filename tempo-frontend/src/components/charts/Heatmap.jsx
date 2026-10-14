import { useMemo, useState } from 'react';
import { format, subDays, startOfDay, getDay, eachDayOfInterval } from 'date-fns';
import { useStore, useActiveHabits } from '../../store/useStore';
import { toISODate, isHabitScheduledOn } from '../../utils/dates';
import { getHeatmapLevel } from '../../utils/streaks';

export function Heatmap({ days = 365 }) {
  const habits = useActiveHabits();
  const completions = useStore((s) => s.completions);
  const [tooltip, setTooltip] = useState(null);

  const today = startOfDay(new Date());
  const start = subDays(today, days - 1);

  const cells = useMemo(() => {
    const allDays = eachDayOfInterval({ start, end: today });
    // Pad to start on weekStartsOn Monday (or Sunday)
    const startPad = getDay(start); // 0=Sun
    const pad = startPad; // align to Sunday columns like GitHub

    const result = [];
    for (let i = 0; i < pad; i++) {
      result.push(null);
    }

    allDays.forEach((day) => {
      const iso = toISODate(day);
      let scheduled = 0;
      let done = 0;
      habits.forEach((h) => {
        if (isHabitScheduledOn(h, day)) {
          scheduled += 1;
          if ((completions[h.id] || []).includes(iso)) done += 1;
        }
      });
      const rate = scheduled ? done / scheduled : 0;
      result.push({
        date: iso,
        day,
        level: scheduled === 0 ? 0 : getHeatmapLevel(rate),
        done,
        scheduled,
      });
    });
    return result;
  }, [habits, completions, days, start, today]);

  // Group into weeks (columns)
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const levelColors = [
    'var(--color-border)',
    'color-mix(in srgb, var(--color-primary) 25%, transparent)',
    'color-mix(in srgb, var(--color-primary) 45%, transparent)',
    'color-mix(in srgb, var(--color-primary) 70%, transparent)',
    'var(--color-primary)',
  ];

  return (
    <div className="relative overflow-x-auto">
      <div className="inline-flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell, di) => {
              if (!cell) {
                return <div key={di} className="w-[11px] h-[11px]" />;
              }
              return (
                <div
                  key={cell.date}
                  className="w-[11px] h-[11px] rounded-[2px] cursor-default transition-opacity hover:opacity-80"
                  style={{ background: levelColors[cell.level] }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      ...cell,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 text-2xs text-muted">
        <span>Less</span>
        {levelColors.map((c, i) => (
          <div key={i} className="w-[11px] h-[11px] rounded-[2px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 bg-foreground text-background text-2xs rounded shadow-soft pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          <strong>{format(tooltip.day, 'MMM d, yyyy')}</strong>
          {tooltip.scheduled > 0
            ? ` — ${tooltip.done}/${tooltip.scheduled} habits`
            : ' — no habits scheduled'}
        </div>
      )}
    </div>
  );
}
