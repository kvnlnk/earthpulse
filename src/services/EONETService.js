const EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events';

export function parseEvents(response) {
  return response.events
    .map((event) => {
      const pointGeometries = event.geometry.filter((g) => g.type === 'Point');
      if (pointGeometries.length === 0) return null;

      const latest = pointGeometries[pointGeometries.length - 1];
      const [lng, lat] = latest.coordinates;

      return {
        id: event.id,
        title: event.title,
        categoryId: event.categories[0]?.id || 'unknown',
        categoryTitle: event.categories[0]?.title || 'Unknown',
        lat,
        lng,
        date: latest.date,
        sourceUrl: event.sources[0]?.url || null,
      };
    })
    .filter(Boolean);
}

export async function fetchEvents(days = null) {
  const url = days ? `${EONET_URL}?days=${days}` : EONET_URL;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`EONET API error: ${response.status}`);
  }
  const data = await response.json();
  return parseEvents(data);
}
