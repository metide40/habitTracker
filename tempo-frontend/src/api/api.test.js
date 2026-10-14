import { describe, it, expect, vi } from 'vitest';

vi.stubEnv('VITE_API_URL', ''); // force local mode so tests never need the backend

const mem = {};
globalThis.localStorage = {
  getItem: (k) => mem[k] ?? null,
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: (k) => { delete mem[k]; },
};
const { useStore } = await import('../store/useStore');
const { api } = await import('./index');
const wait = () => new Promise((r) => setTimeout(r, 10));

describe('api layer + store', () => {
  it('hydrates seed data', async () => {
    await useStore.getState().hydrate();
    expect(useStore.getState()._hydrated).toBe(true);
    expect(useStore.getState().habits.length).toBeGreaterThan(0);
  });
  it('creates, toggles and deletes through the api', async () => {
    const h = await useStore.getState().addHabit({ name: 'Test', category: 'health', frequency: { weekdays: [0,1,2,3,4,5,6] } });
    expect((await api.loadAll()).habits.some((x) => x.id === h.id)).toBe(true);
    useStore.getState().toggleCompletion(h.id, '2026-01-01');
    await wait();
    expect((await api.loadAll()).completions[h.id]).toEqual(['2026-01-01']);
    useStore.getState().deleteHabit(h.id);
    await wait();
    expect((await api.loadAll()).habits.some((x) => x.id === h.id)).toBe(false);
  });
});
