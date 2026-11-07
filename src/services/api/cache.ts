/**
 * Tiny localStorage cache for live widgets. Storage can be unavailable
 * (private windows, blocked site data), so every access is guarded.
 */
export function readCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw) as { data: T; timestamp: number };
    return Date.now() - timestamp < ttlMs ? data : null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Storage full or blocked: the widget still works, just uncached.
  }
}

/** "3 min ago", "5 h ago", "2 d ago". */
export function timeAgo(ms: number): string {
  const mins = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}
