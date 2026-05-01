import Globe from 'globe.gl';
import * as THREE from 'three';
import { fetchEvents } from './services/EONETService.js';
import { getCategoryColor, getCategoryEmoji, getCategoryLabel } from './utils/categories.js';
import { open as openPanel } from './panel/EventPanel.js';
import { inject } from '@vercel/analytics';

// --- Vercel Web Analytics ---
inject();

// --- State ---
let allEvents = [];
let hiddenCategories = new Set();
let currentDays = null; // null = all
let selectedPoint = null;

// --- Globe Setup ---
const globe = Globe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  .showAtmosphere(true)
  .atmosphereColor('#4da6ff')
  .atmosphereAltitude(0.25)
  // Points layer config
  .pointsData([])
  .pointLat('lat')
  .pointLng('lng')
  .pointColor((d) => getCategoryColor(d.categoryId))
  .pointAltitude(0.01)
  .pointRadius((d) => getMarkerRadius(d))
  .pointsMerge(false)
  .pointLabel((d) => `
    <div style="
      background: rgba(10,10,30,0.9);
      border: 1px solid ${getCategoryColor(d.categoryId)};
      border-radius: 8px;
      padding: 8px 12px;
      font-family: -apple-system, sans-serif;
      box-shadow: 0 0 20px ${getCategoryColor(d.categoryId)}44;
    ">
      <div style="color:${getCategoryColor(d.categoryId)}; font-size:13px; font-weight:600;">
        ${getCategoryEmoji(d.categoryId)} ${getCategoryLabel(d.categoryId)}
      </div>
      <div style="color:#ccc; font-size:11px; margin-top:3px;">${d.title}</div>
    </div>
  `)

  // Arcs — connect nearby events of same category
  .arcsData([])
  .arcStartLat((d) => d.startLat)
  .arcStartLng((d) => d.startLng)
  .arcEndLat((d) => d.endLat)
  .arcEndLng((d) => d.endLng)
  .arcColor((d) => [`${d.color}88`, `${d.color}88`])
  .arcAltitude(0.1)
  .arcStroke(0.3)
  .arcDashLength(0.6)
  .arcDashGap(0.3)
  .arcDashAnimateTime(0)

  // Rings — pulsing ring on selected marker
  .ringsData([])
  .ringLat('lat')
  .ringLng('lng')
  .ringColor((d) => {
    const color = getCategoryColor(d.categoryId);
    return [color, color + '00'];
  })
  .ringMaxRadius(4)
  .ringPropagationSpeed(2)
  .ringRepeatPeriod(1500)
  .ringAltitude(0.015)

  .onPointClick((point) => {
    selectedPoint = point;
    globe.ringsData([point]);
    openPanel(point);
    globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);
  })
  .onPointHover((point) => {
    document.body.style.cursor = point ? 'pointer' : 'default';
    // Pause rotation while hovering a marker
    if (point) {
      globe.controls().autoRotate = false;
      clearTimeout(rotateTimeout);
    } else {
      rotateTimeout = setTimeout(() => {
        globe.controls().autoRotate = true;
      }, 500);
    }
  })
  (document.getElementById('globe-container'));

// --- Animated Intro — start far away, zoom in ---
globe.pointOfView({ lat: 20, lng: 0, altitude: 6 });
setTimeout(() => {
  globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 2500);
}, 300);

// Resize handler — keeps globe centered
window.addEventListener('resize', () => {
  globe.width(window.innerWidth);
  globe.height(window.innerHeight);
});

// Slow auto-rotation
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.2;
globe.controls().enableDamping = true;
globe.controls().dampingFactor = 0.1;

// Stop auto-rotate only on mouse click (not scroll/zoom), resume after 500ms
let rotateTimeout;
const container = document.getElementById('globe-container');
container.addEventListener('mousedown', () => {
  globe.controls().autoRotate = false;
  clearTimeout(rotateTimeout);
});
container.addEventListener('mouseup', () => {
  rotateTimeout = setTimeout(() => {
    globe.controls().autoRotate = true;
  }, 500);
});

// --- Three.js Enhancements ---
const scene = globe.scene();

// Static star particles background
const starCount = 1500;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 2000;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.7,
  transparent: true,
  opacity: 0.8,
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// --- Marker size based on age ---
function getMarkerRadius(event) {
  const ageMs = Date.now() - new Date(event.date).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays <= 3) return 0.8;
  if (ageDays <= 14) return 0.6;
  if (ageDays <= 30) return 0.5;
  return 0.4;
}

// --- Generate arcs between nearby events of same category ---
function generateArcs(events) {
  const arcs = [];
  const maxDistance = 15; // degrees

  const byCategory = {};
  events.forEach((e) => {
    if (!byCategory[e.categoryId]) byCategory[e.categoryId] = [];
    byCategory[e.categoryId].push(e);
  });

  Object.entries(byCategory).forEach(([catId, catEvents]) => {
    // Only connect if 2-8 events in category (avoid clutter)
    if (catEvents.length < 2 || catEvents.length > 8) return;

    for (let i = 0; i < catEvents.length; i++) {
      for (let j = i + 1; j < catEvents.length; j++) {
        const a = catEvents[i];
        const b = catEvents[j];
        const dist = Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
        if (dist < maxDistance) {
          arcs.push({
            startLat: a.lat,
            startLng: a.lng,
            endLat: b.lat,
            endLng: b.lng,
            color: getCategoryColor(catId),
          });
        }
      }
    }
  });

  return arcs;
}


// --- Filtering ---
function getFilteredEvents() {
  return allEvents.filter((e) => !hiddenCategories.has(e.categoryId));
}

function updateGlobe() {
  const filtered = getFilteredEvents();
  globe.pointsData(filtered);
  globe.arcsData(generateArcs(filtered));
}

// --- Legend with clickable category filter ---
function buildLegend() {
  const legendEl = document.getElementById('legend');
  const activeCategories = [...new Set(allEvents.map((e) => e.categoryId))];

  legendEl.innerHTML = activeCategories
    .map((catId) => {
      const isHidden = hiddenCategories.has(catId);
      const count = allEvents.filter((e) => e.categoryId === catId).length;
      return `
        <div class="legend__item ${isHidden ? 'legend__item--hidden' : ''}" data-category="${catId}">
          <span class="legend__dot" style="background:${getCategoryColor(catId)}; box-shadow: 0 0 6px ${getCategoryColor(catId)};"></span>
          <span class="legend__label">${getCategoryEmoji(catId)} ${getCategoryLabel(catId)}</span>
          <span class="legend__count">${count}</span>
        </div>
      `;
    })
    .join('');

  legendEl.querySelectorAll('.legend__item').forEach((item) => {
    item.addEventListener('click', () => {
      const catId = item.dataset.category;
      if (hiddenCategories.has(catId)) {
        hiddenCategories.delete(catId);
        item.classList.remove('legend__item--hidden');
      } else {
        hiddenCategories.add(catId);
        item.classList.add('legend__item--hidden');
      }
      updateGlobe();
    });
  });
}

// --- Time range filter ---
const timeButtons = document.querySelectorAll('.time-filter__btn');
timeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    timeButtons.forEach((b) => b.classList.remove('time-filter__btn--active'));
    btn.classList.add('time-filter__btn--active');
    const days = btn.dataset.days === 'all' ? null : parseInt(btn.dataset.days);
    currentDays = days;
    loadEvents();
  });
});



// --- Data Loading ---
const errorBanner = document.getElementById('error-banner');
const errorMessage = errorBanner.querySelector('.error-banner__message');
const retryBtn = errorBanner.querySelector('.error-banner__retry');

async function loadEvents() {
  try {
    errorBanner.classList.add('error-banner--hidden');
    const events = await fetchEvents(currentDays);
    allEvents = events;
    updateGlobe();
    buildLegend();
    document.getElementById('loading-overlay')?.classList.add('loading-overlay--hidden');
  } catch (err) {
    errorMessage.textContent = 'Failed to load event data. Please try again.';
    errorBanner.classList.remove('error-banner--hidden');
    document.getElementById('loading-overlay')?.classList.add('loading-overlay--hidden');
  }
}

retryBtn.addEventListener('click', loadEvents);

// Initial load
loadEvents();

// Refresh every 5 minutes
setInterval(loadEvents, 5 * 60 * 1000);
