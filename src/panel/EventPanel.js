import { getCategoryColor, getCategoryLabel, getCategoryEmoji } from '../utils/categories.js';
import { searchImages } from '../services/NASAImageService.js';
import { renderGallery } from './MediaGallery.js';

const panel = document.getElementById('event-panel');
const content = panel.querySelector('.panel__content');
const closeBtn = panel.querySelector('.panel__close');

closeBtn.addEventListener('click', close);

export function open(event) {
  const color = getCategoryColor(event.categoryId);
  const label = getCategoryLabel(event.categoryId);
  const emoji = getCategoryEmoji(event.categoryId);
  const dateStr = new Date(event.date).toLocaleDateString();

  content.innerHTML = `
    <span class="panel__badge" style="border-color:${color}; color:${color}; background:${color}22;">
      ${emoji} ${label}
    </span>
    <h2 class="panel__title">${event.title}</h2>
    <p class="panel__location">${event.lat.toFixed(2)}\u00B0 ${event.lat >= 0 ? 'N' : 'S'}, ${Math.abs(event.lng).toFixed(2)}\u00B0 ${event.lng >= 0 ? 'E' : 'W'}</p>

    <div class="panel__details">
      <div class="panel__detail-label">Date</div>
      <div class="panel__detail-value">${dateStr}</div>
      <div class="panel__detail-label">Category</div>
      <div class="panel__detail-value">${event.categoryTitle}</div>
    </div>

    <div class="panel__media">
      <div class="panel__spinner">Loading media...</div>
    </div>

    <a class="panel__map-link" href="https://www.google.com/maps/@${event.lat},${event.lng},10z" target="_blank" rel="noopener">Open in Google Maps \u2192</a>

    ${event.sourceUrl ? `<a class="panel__source-link" href="${event.sourceUrl}" target="_blank" rel="noopener">View Source \u2192</a>` : ''}
  `;

  panel.classList.remove('panel--hidden');

  loadMedia(event);
}

async function loadMedia(event) {
  const mediaContainer = content.querySelector('.panel__media');
  const results = await searchImages(event.title, event.categoryId);
  renderGallery(results, mediaContainer);
}

export function close() {
  panel.classList.add('panel--hidden');
}
