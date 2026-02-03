const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(req, res) {
  console.log('========================================');
  console.log('🔍 Search endpoint called');
  console.log('Method:', req.method);
  console.log('Query params:', req.query);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" required' });
  }
  
  const cacheKey = `search:${q.toLowerCase()}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ Cache HIT for:', q);
    return res.status(200).json({
      source: 'cache',
      query: q,
      data: cached.data
    });
  }
  
  console.log('❌ Cache MISS - fetching from BGG for:', q);
  
  // Fetch from BGG
  try {
    const bggUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(q)}&type=boardgame`;
    console.log('🌐 Fetching URL:', bggUrl);
    
    // ============================================
    // FIX: Add proper headers for BGG API
    // ============================================
    // BGG requires:
    // 1. User-Agent header (to identify your app)
    // 2. Accept header (to specify you want XML)
    const response = await fetch(bggUrl, {
      headers: {
        'User-Agent': 'game-night-manager-app', // Replace with your info
        'Accept': 'application/xml, text/xml, */*',
      }
    });
    
    console.log('📡 BGG Response status:', response.status);
    console.log('📡 BGG Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`BGG API returned status ${response.status}`);
    }
    
    const xmlData = await response.text();
    
    console.log('📦 BGG Response length:', xmlData.length, 'characters');
    console.log('📦 First 200 chars:', xmlData.substring(0, 200));
    
    // Check if response is actually empty
    if (!xmlData || xmlData.trim().length === 0) {
      console.log('⚠️  BGG returned empty response!');
      return res.status(200).json({
        source: 'bgg',
        query: q,
        data: null,
        error: 'BGG returned empty response'
      });
    }
    
    // Cache it
    cache.set(cacheKey, {
      data: xmlData,
      timestamp: Date.now()
    });
    
    console.log('💾 Cached result for:', q);
    console.log('========================================');
    
    return res.status(200).json({
      source: 'bgg',
      query: q,
      data: xmlData
    });
    
  } catch (error) {
    console.error('❌ Error fetching from BGG:', error);
    console.error('Error details:', error.message);
    console.log('========================================');
    
    return res.status(500).json({ 
      error: 'Failed to fetch from BoardGameGeek',
      details: error.message,
      query: q
    });
  }
}