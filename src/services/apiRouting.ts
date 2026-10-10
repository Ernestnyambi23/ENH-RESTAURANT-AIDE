/**
 * API routing bridge for web and Capacitor.
 *
 * Configure VITE_API_BASE_URL to the deployed HTTPS Express API origin for Android,
 * for example https://api.example.com (origin only; do not append /api).
 * Leave it empty for same-origin web deployments.
 */
const configuredBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const isNativeShell =
  typeof window !== 'undefined' &&
  /capacitor/i.test(window.location.href) ||
  (typeof window !== 'undefined' && Boolean((window as Window & { Capacitor?: unknown }).Capacitor));

export const API_BASE_URL = configuredBase;

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (configuredBase && normalizedPath.startsWith('/api/')) {
    return `${configuredBase}${normalizedPath}`;
  }
  if (isNativeShell && normalizedPath.startsWith('/api/') && !configuredBase) {
    console.error(
      '[ENH API] VITE_API_BASE_URL is not configured. API requests from the installed APK cannot reach the Express backend until an HTTPS backend URL is configured.',
    );
  }
  return normalizedPath;
}

/**
 * Keep existing API call sites compatible while routing their /api requests
 * to the configured backend. This does not rewrite Firebase or other URLs.
 */
const marker = '__enhApiFetchPatched';
const host = globalThis as typeof globalThis & { [marker]?: boolean };
if (typeof window !== 'undefined' && !host[marker]) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return originalFetch(apiUrl(input), init);
    }
    if (input instanceof URL && input.pathname.startsWith('/api/')) {
      return originalFetch(apiUrl(`${input.pathname}${input.search}`), init);
    }
    return originalFetch(input, init);
  }) as typeof window.fetch;
  host[marker] = true;
}
