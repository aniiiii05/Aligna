import axios from 'axios';

const configuredBackend = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');
const host = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalHost = host === 'localhost' || host === '127.0.0.1';

// Use same-origin /api on deployed hosts so auth cookies remain first-party.
const apiOrigin = isLocalHost ? configuredBackend : '';

export const API = `${apiOrigin}/api`;

axios.defaults.withCredentials = true;
