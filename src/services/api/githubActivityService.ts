import type { GitHubActivity, GitHubPushItem } from '../../types';
import { readCache, writeCache } from './cache';

const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Recent public push activity from GitHub's REST API.
 *
 * GitHub's public events feed no longer includes commit messages for push
 * events, so this reports pushes (repo, branch, time) rather than inventing
 * commit details. Returns null when GitHub can't be reached; there is
 * deliberately no placeholder data.
 */
export async function getGitHubActivity(username: string, forceRefresh = false): Promise<GitHubActivity | null> {
  const cacheKey = `gh_activity_v2_${username.toLowerCase()}`;
  if (!forceRefresh) {
    const cached = readCache<GitHubActivity>(cacheKey, CACHE_TTL_MS);
    if (cached) return cached;
  }

  try {
    const headers = { Accept: 'application/vnd.github+json' };
    const [userRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=50`, { headers }),
    ]);
    if (!eventsRes.ok) return null;

    const events = (await eventsRes.json()) as Array<{
      type: string;
      created_at: string;
      repo?: { name?: string };
      payload?: { ref?: string };
    }>;
    const user = userRes.ok ? ((await userRes.json()) as { public_repos?: number }) : null;

    const pushes: GitHubPushItem[] = events
      .filter((e) => e.type === 'PushEvent' && e.repo?.name)
      .slice(0, 8)
      .map((e) => ({
        repo: e.repo!.name!,
        branch: (e.payload?.ref ?? '').replace('refs/heads/', '') || 'main',
        date: e.created_at,
        url: `https://github.com/${e.repo!.name}`,
      }));

    const activity: GitHubActivity = {
      username,
      publicRepos: typeof user?.public_repos === 'number' ? user.public_repos : null,
      pushes,
      fetchedAt: Date.now(),
    };
    writeCache(cacheKey, activity);
    return activity;
  } catch {
    return null;
  }
}
