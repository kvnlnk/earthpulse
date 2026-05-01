import { describe, it, expect } from 'vitest';
import { getCategoryColor, getCategoryLabel, getCategoryEmoji } from '../src/utils/categories.js';

describe('categories', () => {
  it('returns red for wildfires', () => {
    expect(getCategoryColor('wildfires')).toBe('#ff4444');
  });

  it('returns orange for volcanoes', () => {
    expect(getCategoryColor('volcanoes')).toBe('#ff8800');
  });

  it('returns blue for severe storms', () => {
    expect(getCategoryColor('severeStorms')).toBe('#4488ff');
  });

  it('returns green for floods', () => {
    expect(getCategoryColor('floods')).toBe('#44cc44');
  });

  it('returns yellow for earthquakes', () => {
    expect(getCategoryColor('earthquakes')).toBe('#ffcc00');
  });

  it('returns cyan for sea and lake ice', () => {
    expect(getCategoryColor('seaLakeIce')).toBe('#44ffff');
  });

  it('returns white for unknown categories', () => {
    expect(getCategoryColor('unknownThing')).toBe('#ffffff');
  });

  it('returns correct label for wildfires', () => {
    expect(getCategoryLabel('wildfires')).toBe('Wildfire');
  });

  it('returns correct emoji for volcanoes', () => {
    expect(getCategoryEmoji('volcanoes')).toBe('\u{1F30B}');
  });

  it('returns fallback emoji for unknown', () => {
    expect(getCategoryEmoji('unknownThing')).toBe('\u26A0\uFE0F');
  });
});
