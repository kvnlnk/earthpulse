import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchImages, parseImageResults } from '../src/services/NASAImageService.js';

const MOCK_RESPONSE = {
  collection: {
    items: [
      {
        data: [{ title: 'Wildfire Image', media_type: 'image', description: 'A satellite view' }],
        links: [{ href: 'https://images-assets.nasa.gov/image/1/1~thumb.jpg', rel: 'preview' }],
      },
      {
        data: [{ title: 'Wildfire Video', media_type: 'video', description: 'Footage' }],
        links: [{ href: 'https://images-assets.nasa.gov/video/2/2~thumb.jpg', rel: 'preview' }],
      },
    ],
  },
};

describe('parseImageResults', () => {
  it('parses NASA Image API response', () => {
    const result = parseImageResults(MOCK_RESPONSE);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      title: 'Wildfire Image',
      mediaType: 'image',
      description: 'A satellite view',
      thumbnail: 'https://images-assets.nasa.gov/image/1/1~thumb.jpg',
    });
    expect(result[1].mediaType).toBe('video');
  });

  it('returns empty array for empty response', () => {
    const empty = { collection: { items: [] } };
    expect(parseImageResults(empty)).toEqual([]);
  });

  it('skips items without links', () => {
    const noLinks = {
      collection: {
        items: [{ data: [{ title: 'X', media_type: 'image', description: '' }] }],
      },
    };
    expect(parseImageResults(noLinks)).toEqual([]);
  });
});

describe('searchImages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('searches by event title', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_RESPONSE) })
    ));

    const results = await searchImages('Wildfire California');
    expect(fetch).toHaveBeenCalledWith(
      'https://images-api.nasa.gov/search?q=Wildfire+California&media_type=image,video'
    );
    expect(results).toHaveLength(2);
  });

  it('falls back to category search when no results', async () => {
    const emptyResponse = { collection: { items: [] } };

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(emptyResponse) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(MOCK_RESPONSE) })
    );

    const results = await searchImages('Obscure Event', 'wildfires');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(2);
  });

  it('returns empty array on API error', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ));

    const results = await searchImages('Test');
    expect(results).toEqual([]);
  });
});
