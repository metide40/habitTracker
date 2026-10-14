const BASE = import.meta.env.VITE_API_URL || '';
const ACCESS = 'tempo-access';
const REFRESH = 'tempo-refresh';

export const tokens = {
  get access() { return localStorage.getItem(ACCESS); },
  get refresh() { return localStorage.getItem(REFRESH); },
  set({ access, refresh }) {
    if (access) localStorage.setItem(ACCESS, access);
    if (refresh) localStorage.setItem(REFRESH, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

// Turns Django/DRF error bodies ({detail} or {field: [msg]}) into one readable sentence.
function messageFrom(d) {
  if (!d || typeof d !== 'object') return '';
  if (d.detail) return String(d.detail);
  const first = Object.values(d)[0];
  return Array.isArray(first) ? String(first[0]) : typeof first === 'string' ? first : '';
}

export class ApiError extends Error {
  constructor(status, data) {
    super(messageFrom(data) || `Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

async function send(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, { detail: "Can't reach the server. Is the backend running?" });
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

let refreshing = null; // share one refresh between simultaneous requests
function refreshTokens() {
  if (!tokens.refresh) return Promise.reject(new ApiError(401, null));
  refreshing ||= send('/api/auth/refresh/', { method: 'POST', body: { refresh: tokens.refresh }, auth: false })
    .then((t) => tokens.set(t))
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function request(path, opts = {}) {
  try {
    return await send(path, opts);
  } catch (e) {
    if (e.status !== 401 || opts.auth === false) throw e;
    try {
      await refreshTokens();
    } catch {
      tokens.clear();
      globalThis.dispatchEvent?.(new Event('tempo:logout'));
      throw e;
    }
    return send(path, opts);
  }
}
