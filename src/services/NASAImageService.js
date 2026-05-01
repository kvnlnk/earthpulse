const NASA_IMAGE_URL = 'https://images-api.nasa.gov/search';

const CATEGORY_SEARCH_TERMS = {
  wildfires: 'wildfire satellite',
  volcanoes: 'volcano eruption satellite',
  severeStorms: 'hurricane storm satellite',
  floods: 'flood satellite',
  earthquakes: 'earthquake damage satellite',
  seaLakeIce: 'iceberg satellite',
};

export function parseImageResults(response) {
  return response.collection.items
    .filter((item) => item.links && item.links.length > 0)
    .map((item) => ({
      title: item.data[0].title,
      mediaType: item.data[0].media_type,
      description: item.data[0].description || '',
      thumbnail: item.links[0].href,
    }));
}

async function fetchSearch(query) {
  const encoded = encodeURIComponent(query).replace(/%20/g, '+');
  const url = `${NASA_IMAGE_URL}?q=${encoded}&media_type=image,video`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return parseImageResults(data);
}

export async function searchImages(query, categoryId = null) {
  try {
    // 1. Try exact title in quotes for precise match
    let results = await fetchSearch(`"${query}"`);
    if (results.length > 0) return results;

    // 2. Try full title without quotes
    results = await fetchSearch(query);
    if (results.length > 0) return results;

    // 3. Fallback: generic category search
    if (categoryId && CATEGORY_SEARCH_TERMS[categoryId]) {
      results = await fetchSearch(CATEGORY_SEARCH_TERMS[categoryId]);
    }

    return results;
  } catch {
    return [];
  }
}
