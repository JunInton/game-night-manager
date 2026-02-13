import type { VercelRequest, VercelResponse } from '@vercel/node';

const BGG_API_BASE_URL = 'https://boardgamegeek.com/xmlapi2';

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

    if (endpoint === 'search' && query) {
      url = `${BGG_API_BASE_URL}/search?query=${encodeURIComponent(query as string)}&type=boardgame`;
    } else if (endpoint === 'thing' && id) {
      url = `${BGG_API_BASE_URL}/thing?id=${id}&stats=1`;
    } else {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    console.log('Calling BGG API:', url);
    console.log('Token exists?', !!process.env.BGG_BEARER_TOKEN);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BGG_BEARER_TOKEN}`,
      }
    });

    if (!response.ok) {
      throw new Error('BGG API request failed');
    }

    const xmlText = await response.text();

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(xmlText);

  } catch (error) {
    console.error('Error fetching BGG data:', error);
    return res.status(500).json({ error: 'Failed to fetch data from BGG API' });
  }

}