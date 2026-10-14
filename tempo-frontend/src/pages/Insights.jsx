import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from 'recharts';
import { subDays, startOfDay, format, getDay } from 'date-fns';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Heatmap } from '../components/charts/Heatmap';
import { useStore, useActiveHabits } from '../store/useStore';
import { getLongestStreak, getCompletionRate, getDailyCompletionCounts } from '../utils/streaks';
import { getLastNDays, isHabitScheduledOn, toISODate } from '../utils/dates';

const RANGES = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: 'Year' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Insights() {
  const habits = useActiveHabits();
  const completions = useStore((s) => s.completions);
  const focusSessions = useStore((s) => s.focusSessions);
  const categories = useStore((s) => s.categories);
  const [range, setRange] = useState('90');

  const days = Number(range);
  const end = startOfDay(new Date());
  const start = subDays(end, days - 1);

  const stats = useMemo(() => {
    let longest = 0;
    habits.forEach((h) => {
      longest = Math.max(longest, getLongestStreak(h, completions));
    });

    // Best day of week
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayScheduled = [0, 0, 0, 0, 0, 0, 0];
    const allDays = getLastNDays(days);
    allDays.forEach((day) => {
      const iso = toISODate(day);
      const dow = getDay(day);
      habits.forEach((h) => {
        if (isHabitScheduledOn(h, day)) {
          dayScheduled[dow] += 1;
          if ((completions[h.id] || []).includes(iso)) dayTotals[dow] += 1;
        }
      });
    });
    let bestDay = 0;
    let bestRate = 0;
    dayScheduled.forEach((s, i) => {
      if (s > 0) {
        const r = dayTotals[i] / s;
        if (r > bestRate) {
          bestRate = r;
          bestDay = i;
        }
      }
    });

    // Overall rate
    let totalS = 0, totalD = 0;
    habits.forEach((h) => {
      const rate = getCompletionRate(h, completions, start, end);
      // approximate via daily counts
    });
    const counts = getDailyCompletionCounts(habits, completions, allDays);
    counts.forEach((c) => {
      totalS += c.scheduled;
      totalD += c.done;
    });
    const overallRate = totalS ? Math.round((totalD / totalS) * 100) : 0;

    // Focus hours
    const focusMs = focusSessions
      .filter((s) => {
        const d = new Date(s.completedAt);
        return d >= start && d <= end;
      })
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    const focusHours = Math.round((focusMs / 3600) * 10) / 10;

    return { longest, bestDay: DAY_NAMES[bestDay], overallRate, focusHours };
  }, [habits, completions, focusSessions, days, start, end]);

  // 12-week completion rate line
  const weeklyData = useMemo(() => {
    const data = [];
    for (let w = 11; w >= 0; w--) {
      const weekEnd = subDays(end, w * 7);
      const weekStart = subDays(weekEnd, 6);
      const daysInWeek = getLastNDays(7, weekEnd);
      // adjust
      const counts = getDailyCompletionCounts(habits, completions, daysInWeek);
      let s = 0, d = 0;
      counts.forEach((c) => { s += c.scheduled; d += c.done; });
      data.push({
        label: format(weekStart, 'MMM d'),
        rate: s ? Math.round((d / s) * 100) : 0,
      });
    }
    return data;
  }, [habits, completions, end]);

  // Category breakdown
  const categoryData = useMemo(() => {
    return categories
      .map((cat) => {
        const catHabits = habits.filter((h) => h.category === cat.id);
        if (catHabits.length === 0) return null;
        let s = 0, d = 0;
        const allDays = getLastNDays(days);
        allDays.forEach((day) => {
          const iso = toISODate(day);
          catHabits.forEach((h) => {
            if (isHabitScheduledOn(h, day)) {
              s += 1;
              if ((completions[h.id] || []).includes(iso)) d += 1;
            }
          });
        });
        return {
          id: cat.id,
          label: cat.label,
          color: cat.color,
          rate: s ? Math.round((d / s) * 100) : 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.rate - a.rate);
  }, [categories, habits, completions, days]);

  return (
    <div>
      <PageHeader
        title="Insights"
        action={
          <SegmentedControl options={RANGES} value={range} onChange={setRange} />
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Longest streak', value: `${stats.longest}d` },
          { label: 'Best day', value: stats.bestDay },
          { label: 'Completion rate', value: `${stats.overallRate}%` },
          { label: 'Focus hours', value: `${stats.focusHours}h` },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-meta mb-1">{s.label}</p>
            <p className="font-serif text-2xl tabular text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <Card className="mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Activity</h2>
        <Heatmap days={Math.min(days, 365)} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line chart */}
        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">Completion rate · 12 weeks</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
                  interval={2}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
                  width={28}
                />
                <RTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    return (
                      <div className="bg-surface border border-border rounded px-2.5 py-1.5 text-xs shadow-soft">
                        {payload[0].payload.rate}%
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--color-primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category bars */}
        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">By category</h2>
          <div className="space-y-3">
            {categoryData.map((c) => (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{c.label}</span>
                  <span className="tabular text-muted">{c.rate}%</span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${c.rate}%`,
                      background: `var(--color-${c.color})`,
                    }}
                  />
                </div>
              </div>
            ))}
            {categoryData.length === 0 && (
              <p className="text-sm text-muted text-center py-6">No data yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
