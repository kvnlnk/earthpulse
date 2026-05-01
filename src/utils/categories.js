const CATEGORIES = {
  wildfires: { color: '#ff4444', label: 'Wildfire', emoji: '\u{1F525}' },
  volcanoes: { color: '#ff8800', label: 'Volcano', emoji: '\u{1F30B}' },
  severeStorms: { color: '#4488ff', label: 'Severe Storm', emoji: '\u{1F300}' },
  floods: { color: '#44cc44', label: 'Flood', emoji: '\u{1F30A}' },
  earthquakes: { color: '#ffcc00', label: 'Earthquake', emoji: '\u{1FAE8}' },
  seaLakeIce: { color: '#44ffff', label: 'Ice', emoji: '\u{1F9CA}' },
  drought: { color: '#cc8844', label: 'Drought', emoji: '\u2600\uFE0F' },
  dustHaze: { color: '#aa8866', label: 'Dust/Haze', emoji: '\u{1F32B}\uFE0F' },
  landslides: { color: '#886644', label: 'Landslide', emoji: '\u26F0\uFE0F' },
  snow: { color: '#ddeeff', label: 'Snow', emoji: '\u2744\uFE0F' },
  tempExtremes: { color: '#ff6666', label: 'Temperature Extreme', emoji: '\u{1F321}\uFE0F' },
  waterColor: { color: '#22aa88', label: 'Water Color', emoji: '\u{1F4A7}' },
  manmade: { color: '#aa44aa', label: 'Manmade', emoji: '\u{1F3ED}' },
};

const DEFAULT = { color: '#ffffff', label: 'Unknown', emoji: '\u26A0\uFE0F' };

export function getCategoryColor(categoryId) {
  return (CATEGORIES[categoryId] || DEFAULT).color;
}

export function getCategoryLabel(categoryId) {
  return (CATEGORIES[categoryId] || DEFAULT).label;
}

export function getCategoryEmoji(categoryId) {
  return (CATEGORIES[categoryId] || DEFAULT).emoji;
}

export function getAllCategories() {
  return Object.entries(CATEGORIES).map(([id, data]) => ({ id, ...data }));
}
