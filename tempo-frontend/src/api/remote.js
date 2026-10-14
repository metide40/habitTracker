import { request } from './client';

/**
 * REST contract for the Django backend. Same interface as local.js.
 * Payloads use the shapes the frontend already uses (camelCase, ISO dates).
 *
 *  GET    /api/bootstrap/            -> { habits, completions: {habitId: ['2026-10-04']}, focusSessions, settings }
 *  POST   /api/habits/               -> habit            PATCH/DELETE /api/habits/:id/
 *  POST   /api/habits/:id/toggle/    {date} -> {done}
 *  POST   /api/sessions/             -> session
 *  PATCH  /api/settings/             -> settings
 *  POST   /api/import/  {…bootstrap} -> bootstrap        POST /api/reset/ -> bootstrap
 */
export const remote = {
  loadAll: () => request('/api/bootstrap/'),
  createHabit: (body) => request('/api/habits/', { method: 'POST', body }),
  updateHabit: (id, body) => request(`/api/habits/${id}/`, { method: 'PATCH', body }),
  deleteHabit: (id) => request(`/api/habits/${id}/`, { method: 'DELETE' }),
  toggleCompletion: (id, date) => request(`/api/habits/${id}/toggle/`, { method: 'POST', body: { date } }),
  createSession: (body) => request('/api/sessions/', { method: 'POST', body }),
  updateSettings: (body) => request('/api/settings/', { method: 'PATCH', body }),
  importAll: (body) => request('/api/import/', { method: 'POST', body }),
  resetAll: () => request('/api/reset/', { method: 'POST' }),
};
