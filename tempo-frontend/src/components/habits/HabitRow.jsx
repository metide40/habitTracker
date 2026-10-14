import { Flame } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { getCurrentStreak } from '../../utils/streaks';
import { useStore } from '../../store/useStore';
import { toISODate } from '../../utils/dates';

const colorDot = {
  sage: 'bg-category-sage',
  coral: 'bg-category-coral',
  amber: 'bg-category-amber',
  sky: 'bg-category-sky',
  rose: 'bg-category-rose',
};

export function HabitRow({ habit, showStreak = true }) {
  const completions = useStore((s) => s.completions);
  const toggle = useStore((s) => s.toggleCompletion);
  const today = toISODate();
  const done = (completions[habit.id] || []).includes(today);
  const streak = getCurrentStreak(habit, completions);

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-fast
        hover:bg-background group
        ${done ? 'habit-done' : ''}
      `}
    >
      <Checkbox
        checked={done}
        onChange={() => toggle(habit.id, today)}
        label={`Mark ${habit.name} as ${done ? 'incomplete' : 'complete'}`}
      />
      <div className="flex-1 min-w-0">
        <span className="habit-name text-sm font-medium text-foreground truncate block">
          {habit.name}
        </span>
      </div>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colorDot[habit.color] || 'bg-muted'}`} />
      {showStreak && streak > 0 && (
        <span className="flex items-center gap-1 text-xs text-muted tabular">
          <Flame className="w-3 h-3 text-category-amber" />
          {streak}
        </span>
      )}
    </div>
  );
}
