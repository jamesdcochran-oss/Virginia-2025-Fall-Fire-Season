/* dashboard.js
   Stabilized loader and initialization for Five Forks dashboard.
   - Loads counties from data/counties.json with exponential-backoff retry and fallback list.
   - Initializes map (Leaflet) and attaches a tile fallback handler.
   - Creates basic county cards and map markers.
   - Defensive DOM wiring for toggles and refresh.
*/

/* ========= County list loader & fallback ========= */
// Fallback list (kept minimal and matching the JSON default)
let COUNTIES = [
  { name: 'Dinwiddie', lat: 37.0751, lon: -77.5831 },
  { name: 'Brunswick', lat: 36.7168, lon: -77.85 },
  { name: 'Greensville', lat: 36.6835, lon: -77.5664 },
  { name: 'Amelia', lat: 37.35, lon: -77.97 },
  { name: 'Prince George', lat: 37.1835, lon: -77.2831 },
  { name: 'Nottoway', lat: 37.1, lon: -78.07 }
];

// Load counties.json with exponential-backoff retries (maxRetries = 3)
function loadCountyList(maxRetries = 3) {
  let attempt = 0;

  function tryFetch() {
    attempt++;
    return fetch('data/counties.json', { cache: 'no-cache' })
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch data/counties.json: ' + r.status);
        return r.json();
      })
      .then(json => {
        if (Array.isArray(json) && json.length) {
          COUNTIES = json;
        }
        return COUNTIES;
      })
      .catch(err => {
        console.warn(`counties.json load attempt ${attempt} failed:`, err);
        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.info(`Retrying counties.json in ${delay}ms...`);
          return new Promise(resolve => setTimeout(resolve, delay)).then(tryFetch);
        }
        console.warn('Using fallback COUNTIES list.');
        return COUNTIES;
      });
  }

  return tryFetch();
}

/* ========= Map initialization & tile fallback ========= */
let mapInstance = null;
let markersLayer = null;

function initMap() {
  try {
    if (mapInstance) return mapInstance;
    mapInstance = L.map('map', { zoomControl: false }).setView([37.2, -77.5], 8);

    const primary = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; CartoDB, &copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    primary.addTo(mapInstance);

    // Zoom control (place at top-left)
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    // Marker layer group
    markersLayer = L.layerGroup().addTo(mapInstance);

    // Attach tile error fallback: if many tiles fail, switch to OSM
    attachTileFallback(primary, mapInstance);

    return mapInstance;
  } catch (e) {
    console.error('initMap error', e);
    return null;
  }
}

// Tile fallback logic: after a number of tileerror events replace primary with fallback
function attachTileFallback(tileLayer, map) {
  let failed = 0;
  const threshold = 12;
  tileLayer.on('tileerror', () => {
    failed++;
    if (failed === threshold) {
      console.warn('Primary tile provider failing — switching to fallback OpenStreetMap tiles');
      try {
        const fallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        });
        // remove existing tile layers
        map.eachLayer(layer => {
          if (layer instanceof L.TileLayer) map.removeLayer(layer);
        });
        fallback.addTo(map);
      } catch (e) {
        console.error('Error switching to fallback tiles', e);
      }
    }
  });
}

/* ========= UI helpers: county cards & markers ========= */
function clearCountyCards() {
  const grid = document.getElementById('countyGrid');
  if (grid) grid.innerHTML = '';
}

function createCountyCard(county) {
  const div = document.createElement('div');
  div.className = 'county-card';
  div.innerHTML = `
    <h3>${county.name}</h3>
    <p class="small">Lat: ${county.lat}, Lon: ${county.lon}</p>
    <p class="status">Loading...</p>
  `;
  return div;
}

function addCountyMarker(county) {
  if (!mapInstance || !markersLayer) return;
  const marker = L.circleMarker([county.lat, county.lon], {
    radius: 7,
    fillColor: '#ff7800',
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  });
  marker.bindPopup(`<strong>${county.name}</strong>`);
  markersLayer.addLayer(marker);
}

/* loadCountyData performs the UI population using COUNTIES */
function loadCountyData() {
  try {
    clearCountyCards();
    const grid = document.getElementById('countyGrid');
    if (!grid) {
      console.warn('No #countyGrid element found to populate county cards.');
      return;
    }

    COUNTIES.forEach(c => {
      const card = createCountyCard(c);
      grid.appendChild(card);
      // populate placeholder data; real API fetch logic can be added here
      setTimeout(() => {
        const status = card.querySelector('.status');
        if (status) status.textContent = 'Data: not fetched in this build';
      }, 0);

      // Add marker on map
      addCountyMarker(c);
    });
  } catch (e) {
    console.error('loadCountyData error', e);
    const grid = document.getElementById('countyGrid');
    if (grid) grid.innerHTML = '<p class="fail">Unable to load county data. Please refresh.</p>';
  }
}

/* ========= Utility: refresh data with exponential backoff ========= */
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 4;

function refreshData() {
  refreshAttempts = 0;
  attemptRefresh();
}

function attemptRefresh() {
  refreshAttempts++;
  loadCountyList().then(() => {
    // clear and repopulate markers/cards
    if (markersLayer) markersLayer.clearLayers();
    loadCountyData();
  }).catch(err => {
    console.warn('refresh attempt failed', err);
    if (refreshAttempts < MAX_REFRESH_ATTEMPTS) {
      const delay = Math.pow(2, refreshAttempts) * 1000;
      setTimeout(attemptRefresh, delay);
    } else {
      console.error('Max refresh attempts reached');
      const grid = document.getElementById('countyGrid');
      if (grid) grid.innerHTML = '<p class="fail">Unable to load county data after multiple attempts. Please try again later.</p>';
    }
  });
}

/* ========= Theme & DOM wiring ========= */
function initTheme() {
  // Simple theme initializer - toggle by data-color-scheme on body
  const body = document.body;
  if (!body) return;
  const stored = localStorage.getItem('theme');
  if (stored) body.setAttribute('data-color-scheme', stored);
}

function toggleTheme() {
  const body = document.body;
  if (!body) return;
  const current = body.getAttribute('data-color-scheme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  body.setAttribute('data-color-scheme', next);
  localStorage.setItem('theme', next);
}

/* ========= Initialization: ensure counties loaded before populating UI ========= */
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initMap();

  loadCountyList().then(() => {
    loadCountyData();
  });

  // Defensive event wiring
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', refreshData);

  // Fuel Calc button (if present in index.html) - open modal safely
  const fuelCalcBtn = document.getElementById('fuelCalcBtn');
  const fuelCalcModal = document.getElementById('fuelCalcModal');
  if (fuelCalcBtn && fuelCalcModal) {
    fuelCalcBtn.addEventListener('click', () => {
      fuelCalcModal.style.display = 'block';
    });
  }
});
