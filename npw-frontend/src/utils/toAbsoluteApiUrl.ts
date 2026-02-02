import { API_BASE_URL } from '../api/client';

export const toAbsoluteApiUrl = (maybeRelative: string) => {
  const s = String(maybeRelative || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) {
    const apiOrigin = API_BASE_URL.replace(/\/?api\/?$/, '');
    return `${apiOrigin}${s}`;
  }
  return s;
};
