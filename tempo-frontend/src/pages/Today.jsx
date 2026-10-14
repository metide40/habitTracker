import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, CheckCircle2, Clock, Play } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Button } from '../components/ui/Button';
import { HabitRow } from '../components/habits/HabitRow';
import { WeeklyChart } from '../components/charts/WeeklyChart';
import { useStore, useActiveHabits } from '../store/useStore';
import { getGreeting, toISODate, isHabitScheduledOn, getWeekDays } from '../utils/dates';
import { getCurrentStreak, getDailyCompletionCounts } from '../utils/streaks';
import { startOfDay, subDays, isToday as isTodayFn, parseISO } from 'date-fns';

const TIME_GROUPS = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
  { key: 'anytime', label: 'Anytime' },
];

export default function Today() {
  const habits = useActiveHabits();
  const completions = useStore((s) => s.completions);
  const focusSessions = useStore((s) => s.focusSessions);
  const weekStartsOn = useStore((s) => s.settings?.weekStartsOn ?? 1);
  const today = startOfDay(new Date());
  const todayISO = toISODate(today);

  const scheduledToday = useMemo(
    () => habits.filter((h) => isHabitScheduledOn(h, today)),
    [habits, today]
  );

  const doneCount = scheduledToday.filter((h) =>
    (completions[h.id] || []).includes(todayISO)
  ).length;

  const progress = scheduledToday.length
    ? doneCount / scheduledToday.length
    : 0;

  const bestStreak = habits.reduce((max, h) => {
    const s = getCurrentStreak(h, completions);
    return Math.max(max, s);
  }, 0);

  const weekDays = getWeekDays(weekStartsOn);
  const weekCounts = getDailyCompletionCounts(habits, completions, weekDays);
  const weekRate = (() => {
    let s = 0, d = 0;
    weekCounts.forEach((c) => { s += c.scheduled; d += c.done; });
    return s ? Math.round((d / s) * 100) : 0;
  })();

  const focusToday = focusSessions
    .filter((s) => {
      try {
        return isTodayFn(parseISO(s.completedAt));
      } catch {
        return false;
      }
    })
    .reduce((sum, s) => sum + (s.duration || 0), 0);

  const focusMinutes = Math.round(focusToday / 60);

  const grouped = TIME_GROUPS.map((g) => ({
    ...g,
    habits: scheduledToday.filter((h) => (h.timeOfDay || 'anytime') === g.key),
  })).filter((g) => g.habits.length > 0);

  return (
    <div>
      <PageHeader
        title={`${getGreeting()}`}
        subtitle={`${doneCount} of ${scheduledToday.length} done today`}
      />

      {/* Progress + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Card className="flex items-center gap-4">
          <ProgressRing progress={progress} size={48} stroke={4} />
          <div>
            <p className="text-meta">Today</p>
            <p className="font-serif text-2xl tabular text-foreground">
              {doneCount}<span className="text-muted text-base">/{scheduledToday.length}</span>
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-category-amber/15 flex items-center justify-center">
            <Flame className="w-5 h-5 text-category-amber" />
          </div>
          <div>
            <p className="text-meta">Best streak</p>
            <p className="font-serif text-2xl tabular text-foreground">{bestStreak}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-meta">This week</p>
            <p className="font-serif text-2xl tabular text-foreground">{weekRate}%</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Checklist */}
        <div className="lg:col-span-3 space-y-5">
          {grouped.length === 0 ? (
            <Card>
              <p className="text-sm text-muted text-center py-6">No habits scheduled for today.</p>
            </Card>
          ) : (
            grouped.map((group) => (
              <div key={group.key}>
                <h2 className="text-meta mb-2 px-1">{group.label}</h2>
                <Card padding={false} className="divide-y divide-border overflow-hidden">
                  {group.habits.map((h) => (
                    <HabitRow key={h.id} habit={h} />
                  ))}
                </Card>
              </div>
            ))
          )}
        </div>

        {/* Side column */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-foreground mb-3">This week</h2>
            <WeeklyChart />
          </Card>

          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-meta">Focus today</p>
                <p className="font-serif text-xl tabular text-foreground">{focusMinutes} min</p>
              </div>
            </div>
            <Link to="/focus">
              <Button size="sm" variant="secondary">
                <Play className="w-3.5 h-3.5" /> Start
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
