import type { LeetCodeStats } from '../../types';

const CACHE_KEY = 'oren_leetcode_stats_cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const SEED_LEETCODE_STATS: LeetCodeStats = {
  username: 'Oreniscool',
  ranking: 'Top 8.5% (Global)',
  totalSolved: 215,
  totalQuestions: 3100,
  easySolved: 110,
  totalEasy: 820,
  mediumSolved: 85,
  totalMedium: 1640,
  hardSolved: 20,
  totalHard: 720,
  acceptanceRate: 68.4,
  reputation: 154,
};

export class LeetCodeService {
  async getStats(username: string = 'Oreniscool', forceRefresh = false): Promise<LeetCodeStats> {
    const cacheKey = `${CACHE_KEY}_${username.toLowerCase()}`;

    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL_MS) {
            return data as LeetCodeStats;
          }
        }
      } catch {
        // Ignore cache errors
      }
    }

    try {
      // Primary API: leetcode-stats-api
      const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' || json.totalSolved !== undefined) {
          const stats: LeetCodeStats = {
            username,
            ranking: json.ranking ? `#${json.ranking.toLocaleString()}` : 'Top 8.5%',
            totalSolved: json.totalSolved ?? SEED_LEETCODE_STATS.totalSolved,
            totalQuestions: json.totalQuestions ?? SEED_LEETCODE_STATS.totalQuestions,
            easySolved: json.easySolved ?? SEED_LEETCODE_STATS.easySolved,
            totalEasy: json.totalEasy ?? SEED_LEETCODE_STATS.totalEasy,
            mediumSolved: json.mediumSolved ?? SEED_LEETCODE_STATS.mediumSolved,
            totalMedium: json.totalMedium ?? SEED_LEETCODE_STATS.totalMedium,
            hardSolved: json.hardSolved ?? SEED_LEETCODE_STATS.hardSolved,
            totalHard: json.totalHard ?? SEED_LEETCODE_STATS.totalHard,
            acceptanceRate: json.acceptanceRate ?? SEED_LEETCODE_STATS.acceptanceRate,
            reputation: json.reputation ?? SEED_LEETCODE_STATS.reputation,
          };

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(cacheKey, JSON.stringify({ data: stats, timestamp: Date.now() }));
            } catch {
              // Ignore cache write error
            }
          }

          return stats;
        }
      }
    } catch {
      // Try fallback proxy
    }

    try {
      // Secondary API fallback: alfa-leetcode-api
      const res2 = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
      if (res2.ok) {
        const json = await res2.json();
        if (json.totalSolved !== undefined && json.totalSolved > 0) {
          const stats: LeetCodeStats = {
            username,
            ranking: json.ranking ? `#${json.ranking.toLocaleString()}` : 'Active Contender',
            totalSolved: json.totalSolved,
            totalQuestions: 3100,
            easySolved: json.easySolved || 0,
            totalEasy: 820,
            mediumSolved: json.mediumSolved || 0,
            totalMedium: 1640,
            hardSolved: json.hardSolved || 0,
            totalHard: 720,
            acceptanceRate: json.acceptanceRate || 68.4,
          };
          return stats;
        }
      }
    } catch {
      // Use seed fallback
    }

    return { ...SEED_LEETCODE_STATS, username };
  }
}

export const leetCodeService = new LeetCodeService();
