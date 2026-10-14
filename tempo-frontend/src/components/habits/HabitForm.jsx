import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  category: z.string().min(1),
  color: z.string().min(1),
  frequencyType: z.enum(['daily', 'weekdays']),
  weekdays: z.array(z.number()).optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'anytime']),
  reminder: z.string().optional(),
});

const DAY_LABELS = [
  { value: 0, label: 'S' },
  { value: 1, label: 'M' },
  { value: 2, label: 'T' },
  { value: 3, label: 'W' },
  { value: 4, label: 'T' },
  { value: 5, label: 'F' },
  { value: 6, label: 'S' },
];

const COLORS = ['sage', 'coral', 'amber', 'sky', 'rose'];

export function HabitForm({ initial, onSuccess, onCancel }) {
  const addHabit = useStore((s) => s.addHabit);
  const updateHabit = useStore((s) => s.updateHabit);
  const categories = useStore((s) => s.categories);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name || '',
      category: initial?.category || 'health',
      color: initial?.color || 'sage',
      frequencyType: initial?.frequency?.type || 'daily',
      weekdays: initial?.frequency?.weekdays || [1, 2, 3, 4, 5],
      timeOfDay: initial?.timeOfDay || 'morning',
      reminder: initial?.reminder || '',
    },
  });

  const frequencyType = watch('frequencyType');
  const weekdays = watch('weekdays') || [];
  const color = watch('color');

  const toggleDay = (d) => {
    const next = weekdays.includes(d)
      ? weekdays.filter((x) => x !== d)
      : [...weekdays, d].sort();
    setValue('weekdays', next);
  };

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      category: data.category,
      color: data.color,
      frequency:
        data.frequencyType === 'daily'
          ? { type: 'daily' }
          : { type: 'weekdays', weekdays: data.weekdays },
      timeOfDay: data.timeOfDay,
      target: 1,
      reminder: data.reminder || null,
    };
    if (initial) {
      updateHabit(initial.id, payload);
    } else {
      addHabit(payload);
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Name"
        placeholder="e.g. Morning run"
        error={errors.name?.message}
        {...register('name')}
      />

      <Select
        label="Category"
        options={categories.map((c) => ({ value: c.id, label: c.label }))}
        {...register('category')}
      />

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Color</p>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue('color', c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                color === c ? 'border-foreground scale-110' : 'border-transparent'
              }`}
              style={{ background: `var(--color-${c})` }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Frequency</p>
        <div className="flex gap-2 mb-3">
          {['daily', 'weekdays'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue('frequencyType', t)}
              className={`px-3 h-8 text-xs font-medium rounded border transition-colors ${
                frequencyType === t
                  ? 'bg-primary-soft text-primary border-primary/30'
                  : 'border-border text-muted hover:text-foreground'
              }`}
            >
              {t === 'daily' ? 'Every day' : 'Specific days'}
            </button>
          ))}
        </div>
        {frequencyType === 'weekdays' && (
          <div className="flex gap-1.5">
            {DAY_LABELS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                className={`w-8 h-8 text-xs font-medium rounded transition-colors ${
                  weekdays.includes(d.value)
                    ? 'bg-primary text-white'
                    : 'bg-background border border-border text-muted hover:text-foreground'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Select
        label="Time of day"
        options={[
          { value: 'morning', label: 'Morning' },
          { value: 'afternoon', label: 'Afternoon' },
          { value: 'evening', label: 'Evening' },
          { value: 'anytime', label: 'Anytime' },
        ]}
        {...register('timeOfDay')}
      />

      <Input label="Reminder (optional)" type="time" {...register('reminder')} />

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          {initial ? 'Save changes' : 'Create habit'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
