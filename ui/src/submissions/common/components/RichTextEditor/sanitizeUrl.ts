const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function sanitizeUrl(url: string, base?: string): string {
  if (!url) {
    return '#';
  }

  try {
    const parsedUrl = new URL(url.trim(), base);
    return SAFE_URL_PROTOCOLS.has(parsedUrl.protocol) ? parsedUrl.href : '#';
  } catch {
    return '#';
  }
}
