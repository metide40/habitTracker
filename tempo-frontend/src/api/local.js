import { generateSeedData } from '../store/seed';
import { toISODate } from '../utils/dates';
import { normalize } from './defaults';

const KEY = 'tempo-db';
const LEGACY_KEY = 'tempo-storage'; // old zustand-persist key, migrated once

const fresh = () => normalize(generateSeedData());

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null')?.state;
    if (legacy?.habits) return normalize(legacy);
  } catch { /* fall through to seed data */ }
  return fresh();
}
const save = (d) => (localStorage.setItem(KEY, JSON.stringify(d)), d);

// Same interface as remote.js. Everything is async so callers never know the difference.
export const local = {
  loadAll: async () => read(),
  createHabit: async (h) => {
    const d = read();
    const habit = { ...h, id: `habit-${Date.now()}`, createdAt: toISODate(), archived: false };
    d.habits.push(habit);
    save(d);
    return habit;
  },
  updateHabit: async (id, patch) => {
    const d = read();
    d.habits = d.habits.map((h) => (h.id === id ? { ...h, ...patch } : h));
    save(d);
    return d.habits.find((h) => h.id === id);
  },
  deleteHabit: async (id) => {
    const d = read();
    d.habits = d.habits.filter((h) => h.id !== id);
    delete d.completions[id];
    save(d);
  },
  toggleCompletion: async (id, date) => {
    const d = read();
    const list = d.completions[id] || [];
    const done = !list.includes(date);
    d.completions[id] = done ? [...list, date] : list.filter((x) => x !== date);
    save(d);
    return { done };
  },
  createSession: async (s) => {
    const d = read();
    const session = { ...s, id: `fs-${Date.now()}`, completedAt: new Date().toISOString() };
    d.focusSessions.push(session);
    save(d);
    return session;
  },
  updateSettings: async (patch) => {
    const d = read();
    d.settings = { ...d.settings, ...patch };
    return save(d).settings;
  },
  importAll: async (data) => save(normalize(data)),
  resetAll: async () => save(fresh()),
};
