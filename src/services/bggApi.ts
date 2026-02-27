const API_BASE_URL = '/api/bgg';

export async function searchBGG(query: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=search&query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('BGG search failed');

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    return Array.from(xmlDoc.querySelectorAll('item')).map(item => ({
      id: item.getAttribute('id'),
      name: item.querySelector('name')?.getAttribute('value'),
    }));
  } catch (error) {
    console.error('Error fetching BGG data:', error);
    throw error;
  }
}

/** Ensure a BGG image URL is absolute (BGG sometimes returns protocol-relative //...) */
function absoluteUrl(url: string): string {
  if (!url) return '';
  return url.startsWith('//') ? `https:${url}` : url;
}

export async function getGameDetails(gameId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=thing&id=${gameId}`);
    if (!response.ok) throw new Error('BGG game details request failed');

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const item = xmlDoc.querySelector('item');
    const averageWeight = item?.querySelector('averageweight')?.getAttribute('value');

    // <image> is the full-resolution image; <thumbnail> is a small square crop.
    // Always prefer the full-res image for the suggestion screen.
    const imageUrl = absoluteUrl(item?.querySelector('image')?.textContent?.trim() || '');
    const thumbnailUrl = absoluteUrl(item?.querySelector('thumbnail')?.textContent?.trim() || '');

    const weightNum = parseFloat(averageWeight || '2.5');
    const weight: 'light' | 'heavy' = weightNum < 2.5 ? 'light' : 'heavy';

    const playingTimeRaw = item?.querySelector('playingtime')?.getAttribute('value');
    const playingTime = playingTimeRaw ? parseInt(playingTimeRaw, 10) : undefined;

    return {
      id: gameId,
      name: item?.querySelector('name[type="primary"]')?.getAttribute('value') || '',
      weight,
      averageWeight,
      // Full-res for the suggestion screen hero image
      imageUrl: imageUrl || thumbnailUrl,
      // Small crop for list thumbnails (faster to load)
      thumbnailUrl,
      playingTime: playingTime && playingTime > 0 ? playingTime : undefined,
    };
  } catch (error) {
    console.error('Error fetching BGG game details:', error);
    throw error;
  }
}

/**
 * Fetches the BGG "hot" list — the top ~50 trending boardgames right now.
 * Returns only IDs and names; call getMultipleGameDetails to get
 * weights, thumbnails, and playing time.
 */
export async function getHotGames(): Promise<{ id: string; name: string }[]> {
  const response = await fetch(`${API_BASE_URL}?endpoint=hot`);
  if (!response.ok) throw new Error('BGG hot list request failed');

  const xmlText = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  return Array.from(xmlDoc.querySelectorAll('item'))
    .map(item => ({
      id: item.getAttribute('id') ?? '',
      name: item.querySelector('name')?.getAttribute('value') ?? 'Unknown Game',
    }))
    .filter(g => g.id);
}

export async function getMultipleGameDetails(gameIds: string[]) {
  try {
    const idsParam = gameIds.join(',');
    const response = await fetch(`${API_BASE_URL}?endpoint=thing&id=${idsParam}`);
    if (!response.ok) throw new Error('BGG multiple game details request failed');

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    return Array.from(xmlDoc.querySelectorAll('item')).map(item => {
      const averageWeight = item.querySelector('averageweight')?.getAttribute('value');
      const imageUrl = absoluteUrl(item.querySelector('image')?.textContent?.trim() || '');
      const thumbnailUrl = absoluteUrl(item.querySelector('thumbnail')?.textContent?.trim() || '');
      const weightNum = parseFloat(averageWeight || '2.5');
      const weight: 'light' | 'heavy' = weightNum < 2.5 ? 'light' : 'heavy';

      const playingTimeRaw = item.querySelector('playingtime')?.getAttribute('value');
      const playingTime = playingTimeRaw ? parseInt(playingTimeRaw, 10) : undefined;

      return {
        id: item.getAttribute('id'),
        name: item.querySelector('name')?.getAttribute('value'),
        weight,
        averageWeight,
        imageUrl: imageUrl || thumbnailUrl,
        thumbnailUrl,
        playingTime: playingTime && playingTime > 0 ? playingTime : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching BGG multiple game details:', error);
    throw error;
  }
}