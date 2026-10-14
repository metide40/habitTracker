import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RTooltip } from 'recharts';
import { format, isSameDay } from 'date-fns';
import { useStore, useActiveHabits } from '../../store/useStore';
import { getWeekDays, toISODate, isHabitScheduledOn } from '../../utils/dates';

export function WeeklyChart() {
  const habits = useActiveHabits();
  const completions = useStore((s) => s.completions);
  const weekStartsOn = useStore((s) => s.settings?.weekStartsOn ?? 1);
  const days = getWeekDays(weekStartsOn);
  const today = new Date();

  const data = days.map((day) => {
    let scheduled = 0;
    let done = 0;
    const iso = toISODate(day);
    habits.forEach((h) => {
      if (isHabitScheduledOn(h, day)) {
        scheduled += 1;
        if ((completions[h.id] || []).includes(iso)) done += 1;
      }
    });
    return {
      name: format(day, 'EEE'),
      rate: scheduled ? Math.round((done / scheduled) * 100) : 0,
      done,
      scheduled,
      isToday: isSameDay(day, today),
    };
  });

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={({ x, y, payload }) => (
              <text x={x} y={y + 12} textAnchor="middle" fontSize={11}
                fontWeight={payload.value === format(today, 'EEE') ? 600 : 400}
                fill={payload.value === format(today, 'EEE') ? 'var(--color-foreground)' : 'var(--color-muted)'}>
                {payload.value}
              </text>
            )}
          />
          <YAxis hide domain={[0, 100]} />
          <RTooltip
            cursor={{ fill: 'var(--color-border)', opacity: 0.3 }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-surface border border-border rounded px-2.5 py-1.5 text-xs shadow-soft">
                  <span className="font-medium">{d.done}/{d.scheduled}</span>
                  <span className="text-muted ml-1">({d.rate}%)</span>
                </div>
              );
            }}
          />
          <Bar dataKey="rate" radius={[5, 5, 5, 5]} maxBarSize={28} background={{ fill: 'var(--color-border)', radius: 5 }}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isToday ? 'var(--color-primary)' : 'var(--color-primary)'}
                fillOpacity={entry.isToday ? 1 : 0.55}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
