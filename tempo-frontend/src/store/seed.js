import { subDays, format, startOfDay, getDay } from 'date-fns';

const CATEGORIES = [
  { id: 'health', label: 'Health', color: 'sage' },
  { id: 'focus', label: 'Focus', color: 'sky' },
  { id: 'mind', label: 'Mind', color: 'amber' },
  { id: 'body', label: 'Body', color: 'coral' },
  { id: 'learning', label: 'Learning', color: 'rose' },
];

function iso(d) {
  return format(startOfDay(d), 'yyyy-MM-dd');
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateSeedData() {
  const today = startOfDay(new Date());
  const rand = seededRandom(42);

  const habits = [
    {
      id: 'habit-1',
      name: 'Morning run',
      category: 'health',
      color: 'sage',
      frequency: { type: 'weekdays', weekdays: [1, 2, 3, 4, 5] },
      timeOfDay: 'morning',
      target: 1,
      reminder: '06:30',
      createdAt: iso(subDays(today, 120)),
      archived: false,
    },
    {
      id: 'habit-2',
      name: 'Read 20 pages',
      category: 'learning',
      color: 'rose',
      frequency: { type: 'daily' },
      timeOfDay: 'evening',
      target: 1,
      reminder: '21:00',
      createdAt: iso(subDays(today, 90)),
      archived: false,
    },
    {
      id: 'habit-3',
      name: 'Review inbox once',
      category: 'focus',
      color: 'sky',
      frequency: { type: 'weekdays', weekdays: [1, 2, 3, 4, 5] },
      timeOfDay: 'afternoon',
      target: 1,
      reminder: '14:00',
      createdAt: iso(subDays(today, 60)),
      archived: false,
    },
    {
      id: 'habit-4',
      name: 'Stretch',
      category: 'body',
      color: 'coral',
      frequency: { type: 'daily' },
      timeOfDay: 'morning',
      target: 1,
      reminder: null,
      createdAt: iso(subDays(today, 75)),
      archived: false,
    },
    {
      id: 'habit-5',
      name: 'No phone after 10pm',
      category: 'mind',
      color: 'amber',
      frequency: { type: 'daily' },
      timeOfDay: 'evening',
      target: 1,
      reminder: '22:00',
      createdAt: iso(subDays(today, 45)),
      archived: false,
    },
    {
      id: 'habit-6',
      name: 'Practice Amharic',
      category: 'learning',
      color: 'rose',
      frequency: { type: 'weekdays', weekdays: [1, 3, 5] },
      timeOfDay: 'afternoon',
      target: 1,
      reminder: '17:00',
      createdAt: iso(subDays(today, 50)),
      archived: false,
    },
    {
      id: 'habit-7',
      name: 'Write journal',
      category: 'mind',
      color: 'amber',
      frequency: { type: 'daily' },
      timeOfDay: 'evening',
      target: 1,
      reminder: '21:30',
      createdAt: iso(subDays(today, 100)),
      archived: false,
    },
  ];

  // ~90 days of believable completions
  const completions = {};
  habits.forEach((habit, hi) => {
    const list = [];
    let streakChance = 0.75 + (hi % 3) * 0.05;
    for (let d = 89; d >= 0; d--) {
      const day = subDays(today, d);
      const dayOfWeek = getDay(day);
      let scheduled = true;
      if (habit.frequency.type === 'weekdays') {
        scheduled = habit.frequency.weekdays.includes(dayOfWeek);
      }
      if (!scheduled) continue;

      // Vary probability: higher mid-week, dips on weekends for daily, occasional gaps
      let p = streakChance;
      if (d > 60 && d < 70) p *= 0.5; // intentional gap period
      if (d < 7) p = Math.min(0.95, p + 0.1); // recent strong
      if (rand() < p) {
        list.push(iso(day));
      }
    }
    completions[habit.id] = list;
  });

  // ~40 focus sessions over last 30 days
  const focusSessions = [];
  const modes = ['focus', 'focus', 'focus', 'short', 'long'];
  for (let i = 0; i < 40; i++) {
    const daysAgo = Math.floor(rand() * 30);
    const day = subDays(today, daysAgo);
    const hour = 8 + Math.floor(rand() * 12);
    const duration = [25, 25, 25, 50, 15][Math.floor(rand() * 5)] * 60;
    const habitId = habits[Math.floor(rand() * habits.length)].id;
    focusSessions.push({
      id: `fs-${i}`,
      mode: modes[Math.floor(rand() * modes.length)],
      duration,
      completedAt: new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, Math.floor(rand() * 60)).toISOString(),
      habitId: rand() > 0.3 ? habitId : null,
    });
  }

  return {
    habits,
    completions,
    focusSessions,
    settings: {
      theme: 'system',
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      autoStartBreaks: false,
      soundEnabled: true,
      weekStartsOn: 1,
    },
    categories: CATEGORIES,
  };
}

export { CATEGORIES };
