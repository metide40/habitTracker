import { request, tokens } from './client';

async function start(path, body) {
  const res = await request(path, { method: 'POST', body, auth: false });
  tokens.set(res);
  return res.user;
}

export const authApi = {
  login: (body) => start('/api/auth/login/', body),
  register: (body) => start('/api/auth/register/', body),
  me: () => request('/api/auth/me/'),
  async logout() {
    const refresh = tokens.refresh;
    try {
      if (refresh) await request('/api/auth/logout/', { method: 'POST', body: { refresh } });
    } catch { /* token already invalid: nothing to revoke */ }
    tokens.clear();
  },
};
