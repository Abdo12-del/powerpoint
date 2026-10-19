/**
 * Resolve paths served from `public/` under Vite's base path (including GitHub Pages),
 * while leaving absolute URLs, data URLs, blob URLs, and protocol-relative URLs untouched.
 */
export function resolveMediaUrl(source: string | undefined): string | undefined {
  if (!source || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(source)) return source;
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${source.replace(/^\/+/, '')}`;
}
