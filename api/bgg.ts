import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// ─── BGG API proxy ────────────────────────────────────────────────────────────
// This file is a Vercel serverless function (deployed to /api/bgg) that acts as
// a proxy between the browser and BoardGameGeek's public XML API.
//
// It exists for two reasons:
//   1. CORS — BGG's API doesn't allow direct browser requests, so all calls must
//      go through a server-side intermediary.
//   2. Caching — BGG data changes infrequently, so responses are cached in
//      Upstash Redis to avoid redundant API calls and stay within rate limits.
//
// The browser-side bggApi.ts calls this endpoint with ?endpoint=<name> and any
// additional params. This function maps those to real BGG API URLs, checks the
// cache, and either returns cached XML or fetches fresh XML from BGG.

const BGG_API_BASE_URL = 'https://boardgamegeek.com/xmlapi2';

// Default cache lifetime: 5 days in seconds.
// Game metadata (weight, images, play time) rarely changes, so a long TTL is safe.
const CACHE_DURATION = 60 * 60 * 24 * 5;

// Redis.fromEnv() reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// from environment variables (set in the Vercel project dashboard).
// This client is instantiated once at module load, not per request.
const redis = Redis.fromEnv();

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // ── CORS headers ────────────────────────────────────────────────────────────
  // Allow any origin to call this proxy — the real protection is that this
  // function only ever talks to BGG, so there's no sensitive data to guard.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Browsers send a preflight OPTIONS request before any cross-origin GET.
  // We respond immediately with 200 so the actual request is allowed through.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // endpoint – which BGG API to call: "search", "thing", or "hot"
  // query    – search string (endpoint=search only)
  // id       – comma-separated BGG game ID(s) (endpoint=thing only)
  const { endpoint, query, id } = req.query;

  try {
    let url = '';
    let cacheKey = '';

    if (endpoint === 'search' && query) {
      // Normalise the query to lowercase + trimmed so that "Wingspan" and
      // "wingspan" share the same cache entry rather than making two API calls.
      const normalizedQuery = (query as string).toLowerCase().trim();
      // type=boardgame filters out expansions, accessories, etc. from results.
      url = `${BGG_API_BASE_URL}/search?query=${encodeURIComponent(normalizedQuery)}&type=boardgame`;
      cacheKey = `bgg:search:${normalizedQuery}`;

    } else if (endpoint === 'thing' && id) {
      // id can be a single ID or a comma-separated list (batch fetch).
      // stats=1 includes the averageweight rating needed for light/heavy classification.
      url = `${BGG_API_BASE_URL}/thing?id=${id}&stats=1`;
      cacheKey = `bgg:thing:${id}`;

    } else if (endpoint === 'hot') {
      // BGG "hot" list — top ~50 trending boardgames right now.
      // Cache for only 24 hours since BGG updates it daily.
      url = `${BGG_API_BASE_URL}/hot?type=boardgame`;
      cacheKey = 'bgg:hot';

    } else {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // The hot list gets a shorter TTL (24h) since it changes daily.
    // Everything else uses the default 5-day TTL.
    const cacheTtl = endpoint === 'hot' ? 60 * 60 * 24 : CACHE_DURATION;

    // ── Cache read ─────────────────────────────────────────────────────────────
    // Check Redis before hitting BGG. If we have a cached response, return it
    // immediately — no BGG API call needed, and the Upstash command count stays low.
    const cached = await redis.get<string>(cacheKey);

    if (cached) {
      console.log('Cache hit for key:', cacheKey);
      res.setHeader('Content-Type', 'text/xml');
      // X-Cache: HIT lets the browser devtools confirm a cache hit vs miss.
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).send(cached);
    }

    // ── BGG API call ───────────────────────────────────────────────────────────
    console.log('Cache miss, calling BGG API:', url);

    const response = await fetch(url, {
      headers: {
        // BGG_BEARER_TOKEN is set in Vercel environment variables.
        // BGG's public API doesn't strictly require auth, but including it
        // can increase rate limit headroom on authenticated endpoints.
        Authorization: `Bearer ${process.env.BGG_BEARER_TOKEN}`,
      }
    });

    if (!response.ok) {
      throw new Error(`BGG API request failed with status ${response.status}`);
    }

    const xmlText = await response.text();

    // ── Cache write ────────────────────────────────────────────────────────────
    // setex stores the value with an expiry (TTL in seconds).
    // After cacheTtl seconds, Redis automatically evicts the key.
    await redis.setex(cacheKey, cacheTtl, xmlText);
    console.log('Stored in cache:', cacheKey);

    res.setHeader('Content-Type', 'text/xml');
    // X-Cache: MISS signals that this response came fresh from BGG.
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).send(xmlText);

  } catch (error) {
    console.error('Error fetching BGG data:', error);
    return res.status(500).json({ error: 'Failed to fetch data from BGG API' });
  }
}