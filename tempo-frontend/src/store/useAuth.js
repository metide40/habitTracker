import { create } from 'zustand';
import { REMOTE } from '../api';
import { authApi } from '../api/auth';
import { tokens } from '../api/client';
import { useStore } from './useStore';

export const useAuth = create((set) => ({
  user: null,
  status: REMOTE ? 'loading' : 'in', // loading | in | out (local mode needs no login)

  init: async () => {
    if (!REMOTE) return;
    if (!tokens.access && !tokens.refresh) return set({ status: 'out' });
    try {
      set({ user: await authApi.me(), status: 'in' });
    } catch {
      set({ user: null, status: 'out' });
    }
  },
  login: async (body) => set({ user: await authApi.login(body), status: 'in' }),
  register: async (body) => set({ user: await authApi.register(body), status: 'in' }),
  logout: async () => {
    await authApi.logout();
    useStore.getState().reset();
    set({ user: null, status: 'out' });
  },
}));

// Fired by the API client when a refresh token is rejected (session expired).
globalThis.addEventListener?.('tempo:logout', () => {
  useStore.getState().reset();
  useAuth.setState({ user: null, status: 'out' });
});
