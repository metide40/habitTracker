import { useState, useMemo } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Select } from '../components/ui/Select';
import { FocusTimer } from '../components/focus/FocusTimer';
import { useStore, useActiveHabits } from '../store/useStore';

const MODE_TABS = [
  { value: 'focus', label: 'Focus' },
  { value: 'short', label: 'Short break' },
  { value: 'long', label: 'Long break' },
];

export default function Focus() {
  const settings = useStore((s) => s.settings) || { focusDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, autoStartBreaks: false };
  const habits = useActiveHabits();
  const focusSessions = useStore((s) => s.focusSessions);

  const [mode, setMode] = useState('focus');
  const [habitId, setHabitId] = useState('');

  const duration =
    mode === 'focus'
      ? settings.focusDuration
      : mode === 'short'
        ? settings.shortBreakDuration
        : settings.longBreakDuration;

  const todaySessions = useMemo(
    () =>
      focusSessions
        .filter((s) => {
          try {
            return isToday(parseISO(s.completedAt));
          } catch {
            return false;
          }
        })
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
    [focusSessions]
  );

  const totalMinutes = Math.round(
    todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
  );

  return (
    <div>
      <PageHeader title="Focus" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col items-center">
          <Tabs tabs={MODE_TABS} value={mode} onChange={setMode} className="mb-8" />

          <FocusTimer
            key={`${mode}-${duration}`}
            mode={mode}
            duration={duration}
            habitId={habitId || null}
            onComplete={() => {
              if (settings.autoStartBreaks && mode === 'focus') {
                setMode('short');
              }
            }}
          />

          {mode === 'focus' && (
            <div className="w-full max-w-xs mt-8">
              <Select
                label="Link to habit (optional)"
                value={habitId}
                onChange={(e) => setHabitId(e.target.value)}
                options={[
                  { value: '', label: 'None' },
                  ...habits.map((h) => ({ value: h.id, label: h.name })),
                ]}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <p className="text-meta mb-1">Focus time today</p>
            <p className="font-serif text-3xl tabular text-foreground">{totalMinutes} min</p>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-foreground mb-3">Today&apos;s sessions</h2>
            {todaySessions.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No sessions yet</p>
            ) : (
              <ul className="space-y-2">
                {todaySessions.slice(0, 8).map((s) => {
                  const habit = habits.find((h) => h.id === s.habitId);
                  return (
                    <li
                      key={s.id}
                      className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
                    >
                      <div>
                        <span className="text-foreground capitalize">
                          {s.mode === 'short' ? 'Short break' : s.mode === 'long' ? 'Long break' : 'Focus'}
                        </span>
                        {habit && (
                          <span className="text-muted ml-1.5">· {habit.name}</span>
                        )}
                      </div>
                      <div className="text-muted tabular text-xs">
                        {Math.round(s.duration / 60)}m · {format(parseISO(s.completedAt), 'HH:mm')}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
