import type { LastFmStatus, LastFmTrack } from '../../types';

const LASTFM_CONFIG_KEY = 'oren_lastfm_config';
const LASTFM_CACHE_KEY = 'oren_lastfm_cache';
const CACHE_TTL_MS = 30 * 1000; // 30 seconds cache for live music tracking

// Curated seed data for offline / fallback state
const SEED_LASTFM_STATUS: LastFmStatus = {
  username: 'oreniscool',
  totalScrobbles: 4820,
  currentTrack: {
    name: 'Resonance',
    artist: 'HOME',
    album: 'Odyssey',
    url: 'https://www.last.fm/music/HOME/_/Resonance',
    image: 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png',
    nowPlaying: true,
    playedAt: 'Now Playing',
  },
  recentTracks: [
    {
      name: 'Resonance',
      artist: 'HOME',
      album: 'Odyssey',
      url: 'https://www.last.fm/music/HOME/_/Resonance',
      nowPlaying: true,
      playedAt: 'Now Playing',
    },
    {
      name: 'Memory Reboot',
      artist: 'VOJ & Narvent',
      album: 'Memory Reboot',
      url: 'https://www.last.fm/music/VOJ/_/Memory+Reboot',
      nowPlaying: false,
      playedAt: '12m ago',
    },
    {
      name: 'After Dark',
      artist: 'Mr.Kitty',
      album: 'Time',
      url: 'https://www.last.fm/music/Mr.Kitty/_/After+Dark',
      nowPlaying: false,
      playedAt: '38m ago',
    },
    {
      name: 'Midnight City',
      artist: 'M83',
      album: 'Hurry Up, We\'re Dreaming',
      url: 'https://www.last.fm/music/M83/_/Midnight+City',
      nowPlaying: false,
      playedAt: '1h ago',
    },
    {
      name: 'Nightcall',
      artist: 'Kavinsky',
      album: 'OutRun',
      url: 'https://www.last.fm/music/Kavinsky/_/Nightcall',
      nowPlaying: false,
      playedAt: '2h ago',
    },
  ],
};

export class LastFmService {
  private username: string = 'Qitiya';
  private apiKey: string = 'b25b959554ed76058ac220b7b2e0a026';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LASTFM_CONFIG_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.username) this.username = parsed.username;
          if (parsed.apiKey) this.apiKey = parsed.apiKey;
        }
      } catch {
        // Ignore read errors
      }
    }
  }

  setConfig(username: string, apiKey?: string) {
    this.username = username.trim();
    if (apiKey) this.apiKey = apiKey.trim();

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          LASTFM_CONFIG_KEY,
          JSON.stringify({ username: this.username, apiKey: this.apiKey })
        );
      } catch {
        // Ignore write errors
      }
    }
  }

  getUsername(): string {
    return this.username;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  async getRecentTracks(forceRefresh = false): Promise<LastFmStatus> {
    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`${LASTFM_CACHE_KEY}_${this.username}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL_MS) {
            return data as LastFmStatus;
          }
        }
      } catch {
        // Ignore cache errors
      }
    }

    if (!this.apiKey) {
      // If user hasn't configured an API key yet, return seed fallback
      return { ...SEED_LASTFM_STATUS, username: this.username };
    }

    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
        this.username
      )}&api_key=${encodeURIComponent(this.apiKey)}&format=json&limit=6`;

      const res = await fetch(url);
      if (!res.ok) {
        return { ...SEED_LASTFM_STATUS, username: this.username };
      }

      const json = await res.json();
      const rawTracks = json.recenttracks?.track;

      if (!rawTracks || !Array.isArray(rawTracks)) {
        return { ...SEED_LASTFM_STATUS, username: this.username };
      }

      const totalScrobbles = Number(json.recenttracks['@attr']?.total) || undefined;

      const tracks: LastFmTrack[] = rawTracks.map((t: Record<string, unknown>) => {
        const isNowPlaying = (t['@attr'] as { nowplaying?: string })?.nowplaying === 'true';
        const artist = typeof t.artist === 'object' && t.artist !== null ? (t.artist as { '#text'?: string })['#text'] || 'Unknown' : String(t.artist || 'Unknown');
        const album = typeof t.album === 'object' && t.album !== null ? (t.album as { '#text'?: string })['#text'] || '' : '';
        const imgArr = Array.isArray(t.image) ? t.image : [];
        const largeImg = imgArr[imgArr.length - 1]?.['#text'] || undefined;

        let playedAt = 'Just now';
        if (isNowPlaying) {
          playedAt = 'Now Playing';
        } else if (t.date && typeof t.date === 'object') {
          const dateObj = t.date as { uts?: string; '#text'?: string };
          if (dateObj.uts) {
            const diffMin = Math.max(1, Math.round((Date.now() - Number(dateObj.uts) * 1000) / 60000));
            playedAt = diffMin < 60 ? `${diffMin}m ago` : `${Math.round(diffMin / 60)}h ago`;
          } else if (dateObj['#text']) {
            playedAt = dateObj['#text'];
          }
        }

        return {
          name: String(t.name || 'Untitled'),
          artist,
          album,
          url: String(t.url || 'https://www.last.fm'),
          image: largeImg,
          nowPlaying: isNowPlaying,
          playedAt,
        };
      });

      const currentTrack = tracks.find((t) => t.nowPlaying) || null;

      const statusData: LastFmStatus = {
        username: this.username,
        totalScrobbles,
        currentTrack,
        recentTracks: tracks,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            `${LASTFM_CACHE_KEY}_${this.username}`,
            JSON.stringify({ data: statusData, timestamp: Date.now() })
          );
        } catch {
          // Ignore cache write errors
        }
      }

      return statusData;
    } catch {
      return { ...SEED_LASTFM_STATUS, username: this.username };
    }
  }
}

export const lastFmService = new LastFmService();
