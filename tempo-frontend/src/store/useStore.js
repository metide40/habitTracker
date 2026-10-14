import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { api } from '../api';
import { defaultSettings, normalize } from '../api/defaults';
import { generateSeedData } from './seed';
import { toISODate } from '../utils/dates';

const { categories } = generateSeedData();

// The store is a client-side cache. All persistence goes through src/api.
export const useStore = create((set, get) => {
  // Optimistic update first; if the API call fails, reload the server's truth.
  const sync = (promise) =>
    promise.catch((e) => {
      console.error(e);
      get().hydrate();
    });

  return {
    habits: [],
    completions: {},
    focusSessions: [],
    settings: defaultSettings,
    categories,
    _hydrated: false,
    loadError: null,

    reset: () =>
      set({ habits: [], completions: {}, focusSessions: [], settings: defaultSettings, _hydrated: false, loadError: null }),

    hydrate: async () => {
      try {
        set({ ...normalize(await api.loadAll()), _hydrated: true, loadError: null });
      } catch (e) {
        set({ _hydrated: true, loadError: e.message });
      }
    },

    addHabit: async (habit) => {
      const created = await api.createHabit(habit);
      set((s) => ({ habits: [...s.habits, created] }));
      return created;
    },

    updateHabit: (id, updates) => {
      set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)) }));
      sync(api.updateHabit(id, updates));
    },
    archiveHabit: (id) => get().updateHabit(id, { archived: true }),
    unarchiveHabit: (id) => get().updateHabit(id, { archived: false }),

    deleteHabit: (id) => {
      set((s) => {
        const completions = { ...s.completions };
        delete completions[id];
        return { habits: s.habits.filter((h) => h.id !== id), completions };
      });
      sync(api.deleteHabit(id));
    },

    toggleCompletion: (habitId, date = toISODate()) => {
      set((s) => {
        const list = s.completions[habitId] || [];
        const next = list.includes(date) ? list.filter((d) => d !== date) : [...list, date];
        return { completions: { ...s.completions, [habitId]: next } };
      });
      sync(api.toggleCompletion(habitId, date));
    },

    isCompleted: (habitId, date = toISODate()) => (get().completions[habitId] || []).includes(date),

    addFocusSession: async (session) => {
      const created = await api.createSession(session);
      set((s) => ({ focusSessions: [...s.focusSessions, created] }));
      return created;
    },

    updateSettings: (updates) => {
      set((s) => ({ settings: { ...s.settings, ...updates } }));
      sync(api.updateSettings(updates));
    },

    exportData: () => {
      const { habits, completions, focusSessions, settings } = get();
      return JSON.stringify(
        { habits, completions, focusSessions, settings, exportedAt: new Date().toISOString() },
        null,
        2
      );
    },

    importData: (json) => {
      try {
        const data = normalize(typeof json === 'string' ? JSON.parse(json) : json);
        set(data);
        sync(api.importAll(data).then((res) => set(normalize(res))));
        return true;
      } catch {
        return false;
      }
    },

    // Replaces the account's data with generated demo habits, history and focus sessions.
    loadSampleData: async () => set(normalize(await api.importAll(normalize(generateSeedData())))),

    resetAllData: async () => set(normalize(await api.resetAll())),
  };
});

export const selectActiveHabits = (s) => s.habits.filter((h) => !h.archived);
export const selectArchivedHabits = (s) => s.habits.filter((h) => h.archived);

// useShallow keeps array references stable, which Zustand v5 requires.
export const useActiveHabits = () => useStore(useShallow(selectActiveHabits));
export const useArchivedHabits = () => useStore(useShallow(selectArchivedHabits));

