import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const BGG_API_BASE_URL = 'https://boardgamegeek.com/xmlapi2';
const CACHE_DURATION = 60 * 60 * 24; // 24 hours in seconds

// Initialize Upstash Redis client
const redis = Redis.fromEnv();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint, query, id } = req.query;

  try {
    let url = '';
    let cacheKey = '';

    if (endpoint === 'search' && query) {
      url = `${BGG_API_BASE_URL}/search?query=${encodeURIComponent(query as string)}&type=boardgame`;
      cacheKey = `bgg:search:${query}`;
    } else if (endpoint === 'thing' && id) {
      url = `${BGG_API_BASE_URL}/thing?id=${id}&stats=1`;
      cacheKey = `bgg:thing:${id}`;
    } else {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Try to get cached data first
    const cached = await redis.get<string>(cacheKey);

    if (cached) {
      console.log('Cache hit for key:', cacheKey);
      res.setHeader('Content-Type', 'text/xml');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).send(cached);
    }

    console.log('Cache miss, calling BGG API:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BGG_BEARER_TOKEN}`,
      }
    });

    if (!response.ok) {
      throw new Error(`BGG API request failed with status ${response.status}`);
    }

    const xmlText = await response.text();

    // Store in Redis cache
    await redis.setex(cacheKey, CACHE_DURATION, xmlText);
    console.log('Stored in cache:', cacheKey);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).send(xmlText);

  } catch (error) {
    console.error('Error fetching BGG data:', error);
    return res.status(500).json({ error: 'Failed to fetch data from BGG API' });
  }

}