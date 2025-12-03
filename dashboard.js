// Five Forks Fire Weather Dashboard - Main Script

// County data with centroids for NWS API
const COUNTIES = [
  { name: 'Dinwiddie', lat: 37.0751, lon: -77.5831 },
  { name: 'Brunswick', lat: 36.7168, lon: -77.8500 },
  { name: 'Greensville', lat: 36.6835, lon: -77.5664 },
  { name: 'Amelia', lat: 37.3500, lon: -77.9700 },
  { name: 'Prince George', lat: 37.1835, lon: -77.2831 },
  { name: 'Nottoway', lat: 37.1000, lon: -78.0700 }
];

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initMap();
  loadCountyData();

  // Event listeners
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('fuelCalcBtn').addEventListener('click', openFuelCalcModal);
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-color-scheme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-color-scheme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-color-scheme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Map Initialization
let map;
let countyLayerGroup;

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
  let color = rootStyles.getPropertyValue(varName).trim();

  if (!color) {
    switch (dangerClass) {
      case 1: color = '#4ECDC4'; break;
      case 2: color = '#FFA726'; break;
      case 3: color = '#EF5350'; break;
      case 4: color = '#B71C1C'; break;
      default: color = '#4ECDC4';
    }
  }
  return color;
}

function addCountyMarkers(counties) {
  if (!countyLayerGroup) {
    countyLayerGroup = L.layerGroup().addTo(map);
  }
  countyLayerGroup.clearLayers();

  counties.forEach(county => {
    const fillColor = getDangerColor(county.dangerClass);

    const marker = L.circleMarker([county.lat, county.lon], {
      radius: 8,
      color: '#000',
      weight: 1,
      fillColor: fillColor,
      fillOpacity: 0.85
    });

    const popupContent = `
      <strong>${county.name} County</strong><br>
      Temp: ${county.temp ?? 'N/A'}°F<br>
      RH: ${county.rh ?? 'N/A'}%<br>
      Dew Pt: ${county.dewPoint ?? 'N/A'}°F<br>
      Wind: ${county.wind ?? 'N/A'} mph<br>
      Gust: ${county.gust ?? 'N/A'} mph<br>
      Danger: ${['Low','Moderate','High','Extreme'][Math.max(0, county.dangerClass - 1)]}
    `;

    marker.bindPopup(popupContent);
    marker.addTo(countyLayerGroup);
  });
}

// Load County Weather Data from pre-generated JSON
async function loadCountyData() {
  const countyGrid = document.getElementById('countyGrid');
  countyGrid.innerHTML = '<div class="loading">Loading county data...</div>';
  
  try {
    const response = await fetch('county_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    renderCountyCards(data.counties);
    updateTimestamp(data.lastUpdated);
    
    const countiesWithCoords = data.counties.map(county => ({
      ...county,
      lat: COUNTIES.find(c => c.name === county.name).lat,
      lon: COUNTIES.find(c => c.name === county.name).lon
    }));
    addCountyMarkers(countiesWithCoords);
    
    loadFIRMSData();
    
  } catch (error) {
    console.error('Error loading county data:', error);
    countyGrid.innerHTML = '<div class="error">⚠️ Unable to load county data. Please refresh.</div>';
  }
}

// Load FIRMS fire hotspot data from pre-generated JSON
async function loadFIRMSData() {
  try {
    const response = await fetch('firms_data.json');
    if (!response.ok) {
      console.warn('FIRMS data unavailable');
      return;
    }
    const data = await response.json();
    
    if (data.hotspots && data.hotspots.length > 0) {
      data.hotspots.forEach(hotspot => {
        L.circleMarker([hotspot.latitude, hotspot.longitude], {
          radius: 6,
          color: '#ff4444',
          fillColor: '#ff0000',
          fillOpacity: 0.7,
          weight: 1
        }).bindPopup(`
          <strong>🔥 Fire Hotspot</strong><br>
          Confidence: ${hotspot.confidence}<br>
          Brightness: ${hotspot.brightness}K<br>
          Time: ${hotspot.acq_date} ${hotspot.acq_time}
        `).addTo(map);
      });
    }
  } catch (error) {
    console.warn('Could not load FIRMS data:', error);
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
  countyGrid.innerHTML = '';

  const dangerLabels = ['Low', 'Moderate', 'High', 'Extreme'];

  counties.forEach(county => {
    const rawClass = county.dangerClass || calculateDangerClass(county.temp, county.rh, county.wind);
    const dangerClass = Math.max(1, Math.min(rawClass, dangerLabels.length));
    const label = dangerLabels[dangerClass - 1] || 'N/A';

    const card = document.createElement('div');
    card.className = 'county-card';
    card.innerHTML = `
      <div class="danger-bubble class-${dangerClass}" title="${label}">
        ${dangerClass}
      </div>
      <div class="county-name">${county.name} County</div>
      <div class="county-data">
        <div class="data-row">
          <span class="data-label">Temp</span>
          <span class="data-value">${county.temp ?? 'N/A'}°F</span>
        </div>
        <div class="data-row">
          <span class="data-label">RH</span>
          <span class="data-value">${county.rh ?? 'N/A'}%</span>
        </div>
        <div class="data-row">
          <span class="data-label">Dew Pt</span>
          <span class="data-value">${county.dewPoint ?? 'N/A'}°F</span>
        </div>
        <div class="data-row">
          <span class="data-label">Wind</span>
          <span class="data-value">${county.wind ?? 'N/A'} mph</span>
        </div>
        <div class="data-row">
          <span class="data-label">Gust</span>
          <span class="data-value">${county.gust ?? 'N/A'} mph</span>
        </div>
        <div class="data-row">
          <span class="data-label">Danger</span>
          <span class="data-value">${label}</span>
        </div>
      </div>
    `;
    countyGrid.appendChild(card);
  });
}

function updateTimestamp(timestamp) {
  const lastUpdate = document.getElementById('lastUpdate');
  const date = new Date(timestamp);
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
  refreshBtn.style.animation = 'spin 1s linear';
  await loadCountyData();
  setTimeout(() => {
    refreshBtn.style.animation = '';
  }, 1000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  // Fuel Calculator Modal Controls
  function openFuelCalcModal() {
    const modal = document.getElementById('fuelCalcModal');
      modal.style.display = 'flex';
        // TODO: Build calculator UI interface here
        }

        function closeFuelCalcModal() {
          const modal = document.getElementById('fuelCalcModal');
            modal.style.display = 'none';
            }

            // Modal event listeners
            document.getElementById('modalCloseBtn').addEventListener('click', closeFuelCalcModal);

            // Close modal when clicking backdrop
            document.getElementById('fuelCalcModal').addEventListener('click', function(e) {
              if (e.target === this) closeFuelCalcModal();
              });
`;
document.head.appendChild(style);
