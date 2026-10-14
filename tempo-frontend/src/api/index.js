import { local } from './local';
import { remote } from './remote';

// Set VITE_API_URL in .env to talk to Django; otherwise data lives in localStorage and no login is needed.
export const REMOTE = Boolean(import.meta.env.VITE_API_URL);
export const api = REMOTE ? remote : local;
