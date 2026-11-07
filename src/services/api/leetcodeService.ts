import type { LeetCodeStats } from '../../types';
import { readCache, writeCache } from './cache';

const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * LeetCode stats via the public alfa-leetcode-api proxy (CORS-enabled).
 * Returns null when the proxy can't be reached; no placeholder numbers.
 */
export async function getLeetCodeStats(username: string, forceRefresh = false): Promise<(LeetCodeStats & { fetchedAt: number }) | null> {
  const cacheKey = `lc_stats_v2_${username.toLowerCase()}`;
  if (!forceRefresh) {
    const cached = readCache<LeetCodeStats & { fetchedAt: number }>(cacheKey, CACHE_TTL_MS);
    if (cached) return cached;
  }

  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (typeof json.totalSolved !== 'number') return null;

    const stats = {
      username,
      ranking: typeof json.ranking === 'number' ? json.ranking : '—',
      totalSolved: json.totalSolved,
      totalQuestions: json.totalQuestions ?? 0,
      easySolved: json.easySolved ?? 0,
      totalEasy: json.totalEasy ?? 0,
      mediumSolved: json.mediumSolved ?? 0,
      totalMedium: json.totalMedium ?? 0,
      hardSolved: json.hardSolved ?? 0,
      totalHard: json.totalHard ?? 0,
      acceptanceRate: 0,
      fetchedAt: Date.now(),
    };
    writeCache(cacheKey, stats);
    return stats;
  } catch {
    return null;
  }
}
