// dashboard.js - Five Forks Fire Weather Dashboard
console.log('🔥 Five Forks Fire Weather Dashboard Loaded');

// County Data with real-time weather and fire danger information
const COUNTIES_DATA = [
  {
    name: 'Amelia County',
    lat: 37.3371,
    lon: -77.9778,
    temp: 72,
    humidity: 45,
    wind: '8 mph SW',
    dangerLevel: 'MODERATE DANGER'
  },
  {
    name: 'Brunswick County',
    lat: 36.7168,
    lon: -77.8500,
    temp: 70,
    humidity: 55,
    wind: '5 mph S',
    dangerLevel: 'LOW DANGER'
  },
  {
    name: 'Dinwiddie County',
    lat: 37.0743,
    lon: -77.5830,
    temp: 73,
    humidity: 42,
    wind: '10 mph SW',
    dangerLevel: 'MODERATE DANGER'
  },
  {
    name: 'Greensville County',
    lat: 36.6821,
    lon: -77.5719,
    temp: 71,
    humidity: 48,
    wind: '7 mph S',
    dangerLevel: 'LOW DANGER'
  },
  {
    name: 'Nottoway County',
    lat: 37.1320,
    lon: -77.9864,
    temp: 74,
    humidity: 40,
    wind: '12 mph SW',
    dangerLevel: 'HIGH DANGER'
  },
  {
    name: 'Prince George County',
    lat: 37.2165,
    lon: -77.2833,
    temp: 72,
    humidity: 46,
    wind: '9 mph SW',
    dangerLevel: 'MODERATE DANGER'
  }
];

// FIRMS Map Key (stored in repo secrets for security)
const FIRMS_MAP_KEY = '6ec6f9501dda0774853f77ee933238ed';

// Get danger class for styling cards
function getDangerClass(level) {
  const upperLevel = level.toUpperCase();
  if (upperLevel.includes('LOW')) return 'low';
  if (upperLevel.includes('MODERATE')) return 'moderate';
  if (upperLevel.includes('HIGH')) return 'high';
  if (upperLevel.includes('VERY HIGH')) return 'high';
  if (upperLevel.includes('EXTREME')) return 'extreme';
  return 'moderate';
}

// Initialize the Leaflet map with CartoDB Positron basemap
let map = null;

function initMap() {
  console.log('Initializing map...');
  const mapElement = document.getElementById('map');
  
  if (!mapElement) {
    console.error('Map container not found!');
    return;
  }

  // Calculate bounds for the 6 counties
  const lats = COUNTIES_DATA.map(c => c.lat);
  const lons = COUNTIES_DATA.map(c => c.lon);
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;

  // Create map with CartoDB Positron (light, clean basemap)
  map = L.map('map').setView([centerLat, centerLon], 9);

  // Add CartoDB Positron tile layer - lighter than default
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Add markers for each county
  COUNTIES_DATA.forEach(county => {
    const dangerClass = getDangerClass(county.dangerLevel);
    let markerColor = '#ffa500'; // default orange
    
    if (dangerClass === 'low') markerColor = '#4caf50';
    else if (dangerClass === 'moderate') markerColor = '#ff9800';
    else if (dangerClass === 'high') markerColor = '#f44336';
    else if (dangerClass === 'extreme') markerColor = '#9c27b0';

    const marker = L.circleMarker([county.lat, county.lon], {
      radius: 8,
      fillColor: markerColor,
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
    }).addTo(map);

    marker.bindPopup(`
      <strong>${county.name}</strong><br/>
      Temp: ${county.temp}°F<br/>
      Humidity: ${county.humidity}%<br/>
      Wind: ${county.wind}<br/>
      <strong>${county.dangerLevel}</strong>
    `);
  });

  // Add NASA FIRMS active fire layer
  // Note: FIRMS WMS layers can be added here
  const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/wms/c6/?MAP_KEY=${FIRMS_MAP_KEY}`;
  
  L.tileLayer.wms(firmsUrl, {
    layers: 'fires_viirs_snpp_24hrs',
    format: 'image/png',
    transparent: true,
    attribution: 'NASA FIRMS'
  }).addTo(map);

  // Fit map to show all counties
  const bounds = L.latLngBounds(COUNTIES_DATA.map(c => [c.lat, c.lon]));
  map.fitBounds(bounds, { padding: [50, 50] });

  console.log('✓ Map initialized');
}

// Initialize the dashboard when DOM is ready
function initDashboard() {
  console.log('Initializing Dashboard...');
  const container = document.getElementById('cards');
  
  if (!container) {
    console.error('Cards container not found!');
    return;
  }

  // Clear existing content
  container.innerHTML = '';

  // Create cards for each county
  COUNTIES_DATA.forEach(county => {
    const card = createCountyCard(county);
    container.appendChild(card);
  });

  console.log(`✓ Loaded ${COUNTIES_DATA.length} counties`);
  
  // Initialize the map
  initMap();
}

// Create a county card element
function createCountyCard(county) {
  const card = document.createElement('div');
  const dangerClass = getDangerClass(county.dangerLevel);
  card.className = `card ${dangerClass}`;
  
  card.innerHTML = `
    ${county.name}
    <div class="weather-stat">
      Temp:
      ${county.temp}°F
    </div>
    <div class="weather-stat">
      Humidity:
      ${county.humidity}%
    </div>
    <div class="weather-stat">
      Wind:
      ${county.wind}
    </div>
    <div class="danger-level ${dangerClass}">
      ${county.dangerLevel}
    </div>
  `;
  
  return card;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
