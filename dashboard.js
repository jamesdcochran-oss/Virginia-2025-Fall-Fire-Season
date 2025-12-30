// Five Forks Fire Weather Dashboard - Main Script

const COUNTIES = [
  { name: 'Dinwiddie', lat: 37.0751, lon: -77.5831 },
  { name: 'Brunswick', lat: 36.7168, lon: -77.8500 },
  { name: 'Greensville', lat: 36.6835, lon: -77.5664 },
  { name: 'Amelia', lat: 37.35, lon: -77.97 },
  { name: 'Prince George', lat: 37.1835, lon: -77.2831 },
  { name: 'Nottoway', lat: 37.10, lon: -78.07 }
];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMap();
  loadCountyData();      // fetch and render county stats
  loadFIRMSData();       // overlay FIRMS hotspots
  loadForecastData();    // populate 3-day forecast

  // Buttons & modal hooks
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('refreshBtn')?.addEventListener('click', refreshData);
  document.getElementById('fuelCalcBtn')?.addEventListener('click', openFuelCalcModal);
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeFuelCalcModal);
  document.getElementById('fuelCalcModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeFuelCalcModal();
  });
  document.getElementById('runModelBtn')?.addEventListener('click', runModelFromUI);
});

/* Theme handling */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.dataset.colorScheme = savedTheme;
}
function toggleTheme() {
  const current = document.body.dataset.colorScheme;
  const next = current === 'light' ? 'dark' : 'light';
  document.body.dataset.colorScheme = next;
  localStorage.setItem('theme', next);
}

/* Map setup */
let map;
let countyLayerGroup;
function initMap() {
  map = L.map('map').setView([37.2, -77.6], 8);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© CartoDB'
  }).addTo(map);
  countyLayerGroup = L.layerGroup().addTo(map);
}

/* Data loaders */
async function loadCountyData() {
  const grid = document.getElementById('countyGrid');
  grid.innerHTML = '<div>Loading county data…</div>';
  try {
    const res = await fetch('county_data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    renderCountyCards(data.counties || []);
    updateTimestamp(data.lastUpdated);
    const coords = (data.counties || []).map(c => {
      const ref = COUNTIES.find(x => x.name === c.name);
      return { ...c, lat: ref?.lat, lon: ref?.lon };
    }).filter(c => Number.isFinite(c.lat));
    addCountyMarkers(coords);
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="error">⚠️ Unable to load county data.</div>';
  }
}

async function loadFIRMSData() {
  try {
    const res = await fetch('firms_data.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    (data.hotspots || []).forEach(h => {
      L.circleMarker([h.latitude, h.longitude], {
        radius: 6,
        color: '#ff4444',
        fillColor: '#ff4444',
        fillOpacity: 0.7,
        weight: 2
      }).bindPopup(`🔥 Fire Detection<br>
        Confidence: ${h.confidence || 'Unknown'}<br>
        Brightness: ${h.brightness || 'N/A'}<br>
        Detected: ${h.acq_date || ''} ${h.acq_time || ''} UTC`).addTo(map);
    });
  } catch (err) {
    console.warn('Could not load FIRMS data:', err);
  }
}

async function loadForecastData() {
  try {
    const res = await fetch('forecasts/forecast_data.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('forecastDates').textContent =
      data.dates ? `Forecast Period: ${data.dates}` : '';
    document.getElementById('forecastOverview').innerHTML =
      data.overview ? `<p>${data.overview}</p>` : '';
    if (data.classes && data.classes.length) {
      const headers = ['County', 'Day 1 Local', 'Day 1 DOF', 'Day 2 Local', 'Day 2 DOF', 'Day 3 Local', 'Day 3 DOF'];
      const rows = data.classes.map(c => [
        c.county, c.day1Local, c.day1DOF, c.day2Local, c.day2DOF, c.day3Local, c.day3DOF
      ]);
      buildTable('forecastTable', headers, rows);
    }
  } catch (err) {
    console.warn('Could not load forecast data:', err);
  }
}

/* Rendering helpers */
function renderCountyCards(counties) {
  const grid = document.getElementById('countyGrid');
  grid.innerHTML = '';
  const labels = ['Low', 'Moderate', 'High', 'Extreme'];
  counties.forEach(c => {
    const danger = normalizeDangerClass(c.dangerClass || calculateDangerClass(c.temp, c.rh, c.wind));
    const label = labels[danger - 1] || 'N/A';
    const card = document.createElement('div');
    card.className = 'county-card';
    card.innerHTML = `
      <div class="danger-bubble class-${danger}" title="${label}">${danger}</div>
      <div class="county-name">${c.name} County</div>
      <div class="county-data">
        <div class="data-row"><span class="data-label">Temp</span><span class="data-value">${c.temp ?? 'N/A'}°F</span></div>
        <div class="data-row"><span class="data-label">RH</span><span class="data-value">${c.rh ?? 'N/A'}%</span></div>
        <div class="data-row"><span class="data-label">Dew Pt</span><span class="data-value">${c.dewPoint ?? 'N/A'}°F</span></div>
        <div class="data-row"><span class="data-label">Wind</span><span class="data-value">${c.wind ?? 'N/A'} mph</span></div>
        <div class="data-row"><span class="data-label">Gust</span><span class="data-value">${c.gust ?? 'N/A'} mph</span></div>
        <div class="data-row"><span class="data-label">Danger</span><span class="data-value">${label}</span></div>
      </div>`;
    grid.appendChild(card);
  });
}

function buildTable(id, headers, rows) {
  const table = document.getElementById(id);
  table.innerHTML = '';
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  rows.forEach(r => {
    const tr = document.createElement('tr');
    r.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell ?? '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

function updateTimestamp(ts) {
  const el = document.getElementById('lastUpdate');
  if (!ts) { el.textContent = 'Unknown'; return; }
  const date = new Date(ts);
  el.textContent = date.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
}

/* Danger class helpers */
function normalizeDangerClass(n) {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(4, Math.round(n)));
}
function calculateDangerClass(temp, rh, wind) {
  let score = 0;
  if (temp >= 80) score += 2;
  else if (temp >= 70) score += 1;
  if (rh < 20) score += 3;
  else if (rh < 30) score += 2;
  else if (rh < 40) score += 1;
  if (wind >= 18) score += 2;
  else if (wind >= 12) score += 1;
  if (score <= 2) return 1;
  if (score <= 5) return 2;
  if (score <= 8) return 3;
  return 4;
}

/* Refresh button animation */
async function refreshData() {
  const btn = document.getElementById('refreshBtn');
  btn.style.animation = 'spin 1s linear';
  await Promise.all([loadCountyData(), loadFIRMSData(), loadForecastData()]);
  setTimeout(() => { btn.style.animation = ''; }, 1000);
}
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes spin {from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`;
document.head.appendChild(styleEl);

/* Fuel calculator controls are loaded via fuel-calculator.js */
function openFuelCalcModal() {
  document.getElementById('fuelCalcModal').style.display = 'flex';
}
function closeFuelCalcModal() {
  document.getElementById('fuelCalcModal').style.display = 'none';
}
