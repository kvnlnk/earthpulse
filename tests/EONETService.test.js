import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEvents, parseEvents } from '../src/services/EONETService.js';

const MOCK_RESPONSE = {
  events: [
    {
      id: 'EONET_1234',
      title: 'Wildfire - California',
      categories: [{ id: 'wildfires', title: 'Wildfires' }],
      geometry: [
        { date: '2026-04-28T00:00:00Z', type: 'Point', coordinates: [-119.14, 34.45] }
      ],
      sources: [{ id: 'InciWeb', url: 'https://inciweb.example.com/1234' }],
    },
    {
      id: 'EONET_5678',
      title: 'Volcano - Iceland',
      categories: [{ id: 'volcanoes', title: 'Volcanoes' }],
      geometry: [
        { date: '2026-04-27T00:00:00Z', type: 'Point', coordinates: [-21.32, 63.63] }
      ],
      sources: [{ id: 'SI', url: 'https://si.example.com/5678' }],
    },
  ],
};

describe('parseEvents', () => {
  it('parses EONET response into marker-friendly format', () => {
    const result = parseEvents(MOCK_RESPONSE);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'EONET_1234',
      title: 'Wildfire - California',
      categoryId: 'wildfires',
      categoryTitle: 'Wildfires',
      lat: 34.45,
      lng: -119.14,
      date: '2026-04-28T00:00:00Z',
      sourceUrl: 'https://inciweb.example.com/1234',
    });
  });

  it('uses the latest geometry entry', () => {
    const multiGeom = {
      events: [{
        id: 'E1',
        title: 'Storm',
        categories: [{ id: 'severeStorms', title: 'Storms' }],
        geometry: [
          { date: '2026-04-25T00:00:00Z', type: 'Point', coordinates: [10, 20] },
          { date: '2026-04-27T00:00:00Z', type: 'Point', coordinates: [30, 40] },
        ],
        sources: [{ id: 'X', url: 'https://x.com' }],
      }],
    };
    const result = parseEvents(multiGeom);
    expect(result[0].lat).toBe(40);
    expect(result[0].lng).toBe(30);
  });

  it('skips events without Point geometry', () => {
    const polyGeom = {
      events: [{
        id: 'E2',
        title: 'Ice',
        categories: [{ id: 'seaLakeIce', title: 'Ice' }],
        geometry: [
          { date: '2026-04-25T00:00:00Z', type: 'Polygon', coordinates: [[[0,0],[1,1],[2,2]]] },
        ],
        sources: [],
      }],
    };
    const result = parseEvents(polyGeom);
    expect(result).toHaveLength(0);
  });
});

describe('fetchEvents', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and parses events from EONET API', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_RESPONSE) })
    ));

    const events = await fetchEvents();
    expect(fetch).toHaveBeenCalledWith('https://eonet.gsfc.nasa.gov/api/v3/events');
    expect(events).toHaveLength(2);
    expect(events[0].title).toBe('Wildfire - California');
  });

  it('throws on network error', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ));

    await expect(fetchEvents()).rejects.toThrow('EONET API error: 500');
  });
});
