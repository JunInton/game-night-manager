// ─── BoardGameGeek API helpers ───────────────────────────────────────────────
// BGG's public XML API (https://boardgamegeek.com/wiki/page/BGG_XML_API2) is
// proxied through our own /api/bgg endpoint (configured in vite.config.ts) to
// avoid CORS issues when fetching from the browser.
//
// All responses are XML, not JSON. We use the browser's built-in DOMParser to
// turn the XML string into a DOM tree, then query it with standard selectors.
//
// Endpoints used:
//   ?endpoint=search&query=<text>  – text search, returns matching game IDs/names
//   ?endpoint=thing&id=<id>        – details for one or more comma-separated IDs
//   ?endpoint=hot                  – BGG's current trending ("hot") game list

const API_BASE_URL = '/api/bgg';

// ─── rankSearchResults ────────────────────────────────────────────────────────
// BGG's search API returns results in its own internal order (roughly database
// insertion order), not by name relevance. This means searching "Gloomhaven"
// can surface "Founders of Gloomhaven" before the base game.
//
// This function re-sorts the raw results client-side by assigning each entry a
// priority score based on how closely its name matches the query, then sorting
// ascending (lower score = better match).
//
// Priority tiers (lower = ranked higher):
//   0 – exact match            "wingspan"        → "Wingspan"
//   1 – starts with query      "gloom"           → "Gloomhaven"
//   2 – query is a whole word  "wingspan"        → "Wingspan: European Expansion"
//   3 – contains query         "haven"           → "Gloomhaven"
//   4 – everything else        (BGG's order kept for the tail)
//
// All comparisons are case-insensitive. Ties within the same tier keep
// BGG's original relative order (Array.sort is stable in modern JS engines).
function rankSearchResults(
  results: { id: string | null; name: string | null | undefined }[],
  query: string,
): typeof results {
  const q = query.toLowerCase().trim();
  // We assign a priority score to each result based on how its name matches the query.
  const score = (name: string | null | undefined): number => {
    if (!name) return 4;
    const n = name.toLowerCase();
    if (n === q) return 0;                         // exact match
    if (n.startsWith(q)) return 1;                 // prefix match
    // Whole-word match: query appears at a word boundary in the name.
    // \b is a word-boundary anchor so "wing" matches "Wingspan" but not "awing".
    if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(n)) return 2;
    if (n.includes(q)) return 3;                   // substring match anywhere
    return 4;                                      // no direct match (BGG matched an alternate name)
  };

  // .slice() copies the array before sorting so we don't mutate the original.
  return results.slice().sort((a, b) => score(a.name) - score(b.name));
}

// ─── searchBGG ───────────────────────────────────────────────────────────────
// Searches BGG by name and returns a lightweight list of { id, name } objects,
// re-sorted by relevance to the query (see rankSearchResults above).
// Full details (weight, images, play time) are NOT included here — call
// getGameDetails or getMultipleGameDetails afterwards if you need them.
export async function searchBGG(query: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=search&query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('BGG search failed');

    const xmlText = await response.text();
    const parser = new DOMParser();
    // parseFromString turns the raw XML string into a queryable DOM tree.
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Each <item> element in the search response represents one game.
    // We only pull the BGG id (for later detail fetches) and the display name.
    const raw = Array.from(xmlDoc.querySelectorAll('item')).map(item => ({
      id: item.getAttribute('id'),
      name: item.querySelector('name')?.getAttribute('value'),
    }));

    // Re-sort by relevance before returning — BGG's order is not reliable.
    return rankSearchResults(raw, query);
  } catch (error) {
    console.error('Error fetching BGG data:', error);
    throw error;
  }
}

// ─── absoluteUrl ─────────────────────────────────────────────────────────────
// BGG sometimes returns protocol-relative URLs like "//cf.geekdo-images.com/…"
// instead of "https://…". Browsers accept these in <img src>, but fetch() does
// not, so we normalise them here before storing or displaying.
/** Ensure a BGG image URL is absolute (BGG sometimes returns protocol-relative //...) */
function absoluteUrl(url: string): string {
  if (!url) return '';
  return url.startsWith('//') ? `https:${url}` : url;
}

// ─── getGameDetails ───────────────────────────────────────────────────────────
// Fetches full details for a single game by its BGG numeric ID.
// Returns the game's primary name, weight category, images, and playing time.
export async function getGameDetails(gameId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=thing&id=${gameId}`);
    if (!response.ok) throw new Error('BGG game details request failed');

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const item = xmlDoc.querySelector('item');

    // averageweight is a community-rated complexity score from 1 (easiest) to 5 (hardest).
    // We use 2.5 as the threshold to split games into "light" and "heavy".
    const averageWeight = item?.querySelector('averageweight')?.getAttribute('value');

    // <image> is the full-resolution artwork; <thumbnail> is a small square crop.
    // Always prefer the full-res image for the suggestion screen hero.
    const imageUrl = absoluteUrl(item?.querySelector('image')?.textContent?.trim() || '');
    const thumbnailUrl = absoluteUrl(item?.querySelector('thumbnail')?.textContent?.trim() || '');

    // Convert the 1-5 float to our binary "light" | "heavy" label.
    const weightNum = parseFloat(averageWeight || '2.5');
    const weight: 'light' | 'heavy' = weightNum < 2.5 ? 'light' : 'heavy';

    // playingtime is the total minutes BGG lists. We treat 0 as missing.
    const playingTimeRaw = item?.querySelector('playingtime')?.getAttribute('value');
    const playingTime = playingTimeRaw ? parseInt(playingTimeRaw, 10) : undefined;

    return {
      id: gameId,
      // BGG may list alternate names; the primary name has type="primary".
      name: item?.querySelector('name[type="primary"]')?.getAttribute('value') || '',
      weight,
      averageWeight,
      // Fall back to thumbnail if no full-res image is available.
      imageUrl: imageUrl || thumbnailUrl,
      // Small crop used in list thumbnails — faster to load than the full image.
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
    // Filter out any items that came back without an ID (shouldn't happen, but safe).
    .filter(g => g.id);
}

// ─── getMultipleGameDetails ───────────────────────────────────────────────────
// Batch version of getGameDetails. BGG accepts a comma-separated list of IDs in
// a single request, which is much more efficient than one request per game.
// Returns the same shape as getGameDetails but for an array of games.
export async function getMultipleGameDetails(gameIds: string[]) {
  try {
    // Join all IDs into a single comma-separated string for the API query parameter.
    const idsParam = gameIds.join(',');
    const response = await fetch(`${API_BASE_URL}?endpoint=thing&id=${idsParam}`);
    if (!response.ok) throw new Error('BGG multiple game details request failed');

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // The response contains one <item> element per requested game.
    return Array.from(xmlDoc.querySelectorAll('item')).map(item => {
      const averageWeight = item.querySelector('averageweight')?.getAttribute('value');
      const imageUrl = absoluteUrl(item.querySelector('image')?.textContent?.trim() || '');
      const thumbnailUrl = absoluteUrl(item.querySelector('thumbnail')?.textContent?.trim() || '');

      // Same 2.5 threshold used in getGameDetails.
      const weightNum = parseFloat(averageWeight || '2.5');
      const weight: 'light' | 'heavy' = weightNum < 2.5 ? 'light' : 'heavy';

      const playingTimeRaw = item.querySelector('playingtime')?.getAttribute('value');
      const playingTime = playingTimeRaw ? parseInt(playingTimeRaw, 10) : undefined;

      return {
        id: item.getAttribute('id'),
        // The batch endpoint also returns the primary name via name[type="primary"],
        // but here BGG puts it directly on the first <name> element's value attribute.
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