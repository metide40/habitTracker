export const defaultSettings = {
  theme: 'system',
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  soundEnabled: true,
  weekStartsOn: 1,
};

// Coerce any payload (localStorage, import file, server) into the shape the app expects.
export const normalize = (d = {}) => ({
  habits: Array.isArray(d.habits) ? d.habits : [],
  completions: d.completions && typeof d.completions === 'object' ? d.completions : {},
  focusSessions: Array.isArray(d.focusSessions) ? d.focusSessions : [],
  settings: { ...defaultSettings, ...(d.settings || {}) },
});
