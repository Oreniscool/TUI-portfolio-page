import type { LastFmStatus, LastFmTrack } from '../../types';
import { readCache, writeCache } from './cache';

const CACHE_TTL_MS = 3 * 60 * 1000;

// Last.fm read-only API key. It ships in the browser bundle; moving this call
// behind a small proxy or a scheduled job would keep it private.
const API_KEY = 'b25b959554ed76058ac220b7b2e0a026';

/**
 * Recently played tracks from Last.fm. Returns null when Last.fm can't be
 * reached; no placeholder tracks.
 */
export async function getRecentTracks(username: string, forceRefresh = false): Promise<(LastFmStatus & { fetchedAt: number }) | null> {
  const cacheKey = `lastfm_v2_${username.toLowerCase()}`;
  if (!forceRefresh) {
    const cached = readCache<LastFmStatus & { fetchedAt: number }>(cacheKey, CACHE_TTL_MS);
    if (cached) return cached;
  }

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
      username
    )}&api_key=${API_KEY}&format=json&limit=6`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    const rawTracks = json.recenttracks?.track;
    if (!Array.isArray(rawTracks)) return null;

    const tracks: LastFmTrack[] = rawTracks.map((t: Record<string, unknown>) => {
      const nowPlaying = (t['@attr'] as { nowplaying?: string } | undefined)?.nowplaying === 'true';
      const artist =
        typeof t.artist === 'object' && t.artist !== null
          ? (t.artist as { '#text'?: string })['#text'] || 'Unknown artist'
          : String(t.artist || 'Unknown artist');
      const album =
        typeof t.album === 'object' && t.album !== null ? (t.album as { '#text'?: string })['#text'] || '' : '';
      const uts = (t.date as { uts?: string } | undefined)?.uts;
      return {
        name: String(t.name || 'Untitled'),
        artist,
        album,
        url: String(t.url || 'https://www.last.fm'),
        nowPlaying,
        playedAtMs: uts ? Number(uts) * 1000 : undefined,
      };
    });

    const status = {
      username,
      totalScrobbles: Number(json.recenttracks['@attr']?.total) || undefined,
      currentTrack: tracks.find((t) => t.nowPlaying) ?? null,
      recentTracks: tracks,
      fetchedAt: Date.now(),
    };
    writeCache(cacheKey, status);
    return status;
  } catch {
    return null;
  }
}
