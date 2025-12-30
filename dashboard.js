// Five Forks Fire Weather Dashboard - Main Script

const COUNTIES = [
  { name: 'Dinwiddie', lat: 37.0751, lon: -77.5831 },
  { name: 'Brunswick', lat: 36.7168, lon: -77.8500 },
  { name: 'Greensville', lat: 36.6835, lon: -77.5664 },
  { name: 'Amelia', lat: 37.3500, lon: -77.9700 },
  { name: 'Prince George', lat: 37.1835, lon: -77.2831 },
  { name: 'Nottoway', lat: 37.1000, lon: -78.0700 }
];

let map;
let countyLayerGroup;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMap();

  // Load everything expected by README
  loadCountyData();
  loadForecastData();

  // UI
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('refreshBtn')?.addEventListener('click', refreshData);

  document.getElementById('fuelCalcBtn')?.addEventListener('click', openFuelCalcModal);
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeFuelCalcModal);
  document.getElementById('fuelCalcModal')?.addEventListener('click', (e) => {
    if (e.target?.id === 'fuelCalcModal') closeFuelCalcModal();
  });

  document.getElementById('runModelBtn')?.addEventListener('click', runModelFromUI);
});

// -------------------- Theme --------------------
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-color-scheme', savedTheme);
}
function toggleTheme() {
  const current = document.body.getAttribute('data-color-scheme');
  const next = current === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-color-scheme', next);
  localStorage.setItem('theme', next);
}

// -------------------- Map --------------------
function initMap() {
  map = L.map('map').setView([37.2, -77.7], 8);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© CartoDB',
    maxZoom: 19
  }).addTo(map);

  countyLayerGroup = L.layerGroup().addTo(map);
}

function getDangerColor(dangerClass) {
  const rootStyles = getComputedStyle(document.documentElement);
  const varName = `--class-${dangerClass}-bg`;
  const cssColor = rootStyles.getPropertyValue(varName).trim();
  if (cssColor) return cssColor;

  switch (dangerClass) {
    case 1: return '#4ECDC4';
    case 2: return '#FFA726';
    case 3: return '#EF5350';
    case 4: return '#B71C1C';
    default: return '#4ECDC4';
  }
}

function addCountyMarkers(countiesWithCoords) {
  if (!countyLayerGroup) countyLayerGroup = L.layerGroup().addTo(map);
  countyLayerGroup.clearLayers();

  countiesWithCoords.forEach((county) => {
    const fillColor = getDangerColor(county.dangerClass ?? 1);

    const marker = L.circleMarker([county.lat, county.lon], {
      radius: 8,
      color: '#000',
      weight: 1,
      fillColor,
      fillOpacity: 0.85
    });

    const label = ['Low', 'Moderate', 'High', 'Extreme'][Math.max(0, (county.dangerClass ?? 1) - 1)] ?? 'N/A';

    marker.bindPopup(`
      <strong>${county.name} County</strong><br>
      Temp: ${county.temp ?? 'N/A'}°F<br>
      RH: ${county.rh ?? 'N/A'}%<br>
      Dew Pt: ${county.dewPoint ?? 'N/A'}°F<br>
      Wind: ${county.wind ?? 'N/A'} mph<br>
      Gust: ${county.gust ?? 'N/A'} mph<br>
      Danger: ${label}
    `);

    marker.addTo(countyLayerGroup);
  });
}

// -------------------- Tables --------------------
function buildForecastTable(tableId, headers, rows) {
  const table = document.getElementById(tableId);
  if (!table) return;

  table.innerHTML = '';

  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  headers.forEach((h) => {
    const th = document.createElement('th');
    th.textContent = h;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((cell) => {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

// -------------------- County Data --------------------
async function loadCountyData() {
  const countyGrid = document.getElementById('countyGrid');
  if (countyGrid) countyGrid.innerHTML = '<div class="loading">Loading county data...</div>';

  try {
    const response = await fetch('county_data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`county_data.json HTTP ${response.status}`);

    const data = await response.json();
    const counties = Array.isArray(data.counties) ? data.counties : [];

    renderCountyCards(counties);
    updateTimestamp(data.lastUpdated);

    const countiesWithCoords = counties.map((county) => {
      const match = COUNTIES.find((c) => c.name === county.name);
      return {
        ...county,
        lat: match?.lat,
        lon: match?.lon
      };
    }).filter(c => typeof c.lat === 'number' && typeof c.lon === 'number');

    addCountyMarkers(countiesWithCoords);
    loadFIRMSData();

  } catch (err) {
    console.error('Error loading county data:', err);
    if (countyGrid) countyGrid.innerHTML = '<div class="error">⚠️ Unable to load county data. Please refresh.</div>';
  }
}

async function loadFIRMSData() {
  try {
    const response = await fetch('firms_data.json', { cache: 'no-store' });
    if (!response.ok) return;

    const data = await response.json();
    const hotspots = Array.isArray(data.hotspots) ? data.hotspots : [];

    hotspots.forEach((hotspot) => {
      let color = '#ff4444';
      let satelliteName = 'Unknown';

      if (hotspot.satellite?.includes('MODIS')) { color = '#ff6600'; satelliteName = 'MODIS (Terra/Aqua)'; }
      if (hotspot.satellite?.includes('SNPP'))  { color = '#ff0000'; satelliteName = 'VIIRS S-NPP'; }
      if (hotspot.satellite?.includes('NOAA20')){ color = '#cc0000'; satelliteName = 'VIIRS NOAA-20'; }

      L.circleMarker([hotspot.latitude, hotspot.longitude], {
        radius: 6,
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2
      }).bindPopup(`
        <div style="min-width: 200px;">
          <strong style="font-size: 14px;">🔥 Fire Detection</strong><br><br>
          <b>Satellite:</b> ${satelliteName}<br>
          <b>Confidence:</b> ${hotspot.confidence ?? 'Unknown'}<br>
          <b>Brightness:</b> ${hotspot.brightness ?? 'N/A'}K<br>
          <b>FRP:</b> ${hotspot.frp ?? 'N/A'} MW<br>
          <b>Detected:</b> ${hotspot.acq_date ?? ''} ${hotspot.acq_time ?? ''} UTC
        </div>
      `).addTo(map);
    });
  } catch (err) {
    console.warn('Could not load FIRMS data:', err);
  }
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

function renderCountyCards(counties) {
  const countyGrid = document.getElementById('countyGrid');
  if (!countyGrid) return;

  countyGrid.innerHTML = '';
  const dangerLabels = ['Low', 'Moderate', 'High', 'Extreme'];

  counties.forEach((county) => {
    const rawClass = county.dangerClass || calculateDangerClass(county.temp, county.rh, county.wind);
    const dangerClass = Math.max(1, Math.min(rawClass, dangerLabels.length));
    const label = dangerLabels[dangerClass - 1] || 'N/A';

    const card = document.createElement('div');
    card.className = 'county-card';
    card.innerHTML = `
      <div class="danger-bubble class-${dangerClass}" title="${label}">${dangerClass}</div>
      <div class="county-name">${county.name} County</div>
      <div class="county-data">
        <div class="data-row"><span class="data-label">Temp</span><span class="data-value">${county.temp ?? 'N/A'}°F</span></div>
        <div class="data-row"><span class="data-label">RH</span><span class="data-value">${county.rh ?? 'N/A'}%</span></div>
        <div class="data-row"><span class="data-label">Dew Pt</span><span class="data-value">${county.dewPoint ?? 'N/A'}°F</span></div>
        <div class="data-row"><span class="data-label">Wind</span><span class="data-value">${county.wind ?? 'N/A'} mph</span></div>
        <div class="data-row"><span class="data-label">Gust</span><span class="data-value">${county.gust ?? 'N/A'} mph</span></div>
        <div class="data-row"><span class="data-label">Danger</span><span class="data-value">${label}</span></div>
      </div>
    `;
    countyGrid.appendChild(card);
  });
}

function updateTimestamp(timestamp) {
  const lastUpdate = document.getElementById('lastUpdate');
  if (!lastUpdate) return;

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    lastUpdate.textContent = 'Unknown';
    return;
  }

  lastUpdate.textContent = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

async function refreshData() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.style.animation = 'spin 1s linear';

  await loadCountyData();
  await loadForecastData();

  setTimeout(() => {
    if (refreshBtn) refreshBtn.style.animation = '';
  }, 1000);
}

// -------------------- Forecast Data --------------------
async function loadForecastData() {
  try {
    const response = await fetch('forecasts/forecast_data.json', { cache: 'no-store' });
    if (!response.ok) return;

    const data = await response.json();

    const datesEl = document.getElementById('forecastDates');
    const overviewEl = document.getElementById('forecastOverview');

    if (datesEl && data.dates) datesEl.textContent = `Forecast Period: ${data.dates}`;
    if (overviewEl && data.overview) overviewEl.innerHTML = `<p>${data.overview}</p>`;

    if (Array.isArray(data.classes) && data.classes.length > 0) {
      const headers = ['County', 'Day 1 Local', 'Day 1 DOF', 'Day 2 Local', 'Day 2 DOF', 'Day 3 Local', 'Day 3 DOF'];
      const rows = data.classes.map(c => [c.county, c.day1Local, c.day1DOF, c.day2Local, c.day2DOF, c.day3Local, c.day3DOF]);
      buildForecastTable('forecastTable', headers, rows);
    }
  } catch (err) {
    console.warn('Could not load forecast data:', err);
  }
}

// -------------------- Fuel Calc Modal --------------------
function openFuelCalcModal() {
  const modal = document.getElementById('fuelCalcModal');
  if (!modal) return;
  modal.style.display = 'flex';
  buildFuelCalcForecastTable();
}
function closeFuelCalcModal() {
  const modal = document.getElementById('fuelCalcModal');
  if (!modal) return;
  modal.style.display = 'none';
}

function buildFuelCalcForecastTable() {
  const tbody = document.getElementById('forecastDays');
  if (!tbody) return;

  tbody.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>Day ${i}</td>
      <td><input type="number" id="temp_${i}" value="75" min="0" max="120"></td>
      <td><input type="number" id="rh_${i}" value="30" min="0" max="100"></td>
      <td><input type="number" id="wind_${i}" value="5" min="0" max="50"></td>
      <td><input type="number" id="hours_${i}" value="10" min="0" max="24" step="0.5"></td>
    `;
    tbody.appendChild(row);
  }
}

function runModelFromUI() {
  // This requires runFuelMoistureModel() to exist in fuel-calculator.js
  const initial1Hr = parseFloat(document.getElementById('initial1hr')?.value);
  const initial10Hr = parseFloat(document.getElementById('initial10hr')?.value);

  const forecast = [];
  for (let i = 1; i <= 5; i++) {
    forecast.push({
      label: `Day ${i}`,
      temp: parseFloat(document.getElementById(`temp_${i}`)?.value),
      rh: parseFloat(document.getElementById(`rh_${i}`)?.value),
      wind: parseFloat(document.getElementById(`wind_${i}`)?.value),
      dryingHours: parseFloat(document.getElementById(`hours_${i}`)?.value)
    });
  }

  const results = runFuelMoistureModel({ initial1Hr, initial10Hr, forecast });
  displayResults(results);
}

function displayResults(results) {
  const resultsSection = document.getElementById('resultsSection');
  const resultsTable = document.getElementById('resultsTable');
  const warningBox = document.getElementById('warningMessage');
  if (!resultsSection || !resultsTable || !warningBox) return;

  let html = '<table style="width:100%; border-collapse: collapse;">';
  html += '<tr><th>Day</th><th>1-hr FM (%)</th><th>10-hr FM (%)</th><th>Status</th></tr>';

  const criticalDays = [];
  (results?.dailyResults || []).forEach((day, i) => {
    const critical = (day.moisture1Hr <= 6 || day.moisture10Hr <= 8);
    if (critical) criticalDays.push(i + 1);

    html += `<tr>
      <td>${day.label}</td>
      <td>${day.moisture1Hr}%</td>
      <td>${day.moisture10Hr}%</td>
      <td>${critical ? 'Critical' : 'Normal'}</td>
    </tr>`;
  });

  html += '</table>';
  resultsTable.innerHTML = html;

  if (criticalDays.length) {
    warningBox.innerHTML = `⚠️ CRITICAL FIRE WEATHER: Extremely low fuel moisture on Day${criticalDays.length > 1 ? 's' : ''} ${criticalDays.join(', ')}.`;
    warningBox.style.display = 'block';
  } else {
    warningBox.style.display = 'none';
  }

  resultsSection.style.display = 'block';
}

// Spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);
