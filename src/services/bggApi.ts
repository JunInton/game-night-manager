// const BGG_API_BASE_URL = 'https://boardgamegeek.com/xmlapi2';
// const BEARER_TOKEN = import.meta.env.VITE_BGG_BEARER_TOKEN;

// const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5173/api/bgg' : '/api/bgg';
const API_BASE_URL = '/api/bgg';

export async function searchBGG(query: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=search&query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error('BGG search failed');
    }

    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const items = xmlDoc.querySelectorAll('item');
    const games = Array.from(items).map(item => ({
      id: item.getAttribute('id'),
      name: item.querySelector('name')?.getAttribute('value'),
      yearPublished: item.querySelector('yearpublished')?.getAttribute('value'),
    }))

    return games;

  } catch (error) {
    console.error('Error fetching BGG data:', error);
    throw error;
  }

}

export async function getGameDetails(gameId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=thing&id=${gameId}`);

    if (!response.ok) {
      throw new Error('BGG game details request failed');
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const item = xmlDoc.querySelector('item');
    const averageWeight = item?.querySelector('averageweight')?.getAttribute('value');

    return {
      id: gameId,
      name: item?.querySelector('name[type="primary"]')?.getAttribute('value') || '',
      weight: averageWeight,
      yearPublished: item?.querySelector('yearpublished')?.getAttribute('value'),
    }

  } catch (error) {
    console.error('Error fetching BGG game details:', error);
    throw error;
  }

}

// export async function testBGGApi() {
//   console.log('Testing BGG API ...');

//   console.log('Searching for "Catan"...');
//   const searchResults = await searchBGG('Catan');
//   console.log('Search results:', searchResults);

//   if (searchResults.length > 0) {
//     const gameId = searchResults[0].id;
//     console.log(`Fetching details for game ID ${gameId} ...`);
//     const details = await getGameDetails(gameId!);
//     console.log('Game details:', details);
//   }
// }