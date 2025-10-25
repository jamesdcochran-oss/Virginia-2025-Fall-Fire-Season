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
    name: 'Nottoway County',
    lat: 37.1299,
    lon: -78.0747,
    temp: 75,
    humidity: 38,
    wind: '12 mph W',
    dangerLevel: 'HIGH DANGER'
  },
  {
    name: 'Prince George County',
    lat: 37.2196,
    lon: -77.2894,
    temp: 71,
    humidity: 48,
    wind: '7 mph SSW',
    dangerLevel: 'MODERATE DANGER'
  },
  {
    name: 'Sussex County',
    lat: 36.9165,
    lon: -77.2894,
    temp: 69,
    humidity: 52,
    wind: '6 mph S',
    dangerLevel: 'LOW DANGER'
  }
];

// Determine danger level CSS class based on danger text
function getDangerClass(dangerLevel) {
  const level = dangerLevel.toUpperCase();
  if (level.includes('HIGH')) return 'danger-high';
  if (level.includes('MODERATE')) return 'danger-moderate';
  return 'danger-low';
}

// Generate County Cards
function generateCountyCards() {
  const cardsContainer = document.getElementById('cards');
  if (!cardsContainer) {
    console.error('Cards container not found!');
    return;
  }

  cardsContainer.innerHTML = ''; // Clear existing cards

  COUNTIES_DATA.forEach(county => {
    const card = document.createElement('div');
    card.className = `card ${getDangerClass(county.dangerLevel)}`;
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `${county.name} fire danger information`);

    card.innerHTML = `
      <h3>${county.name}</h3>
      <div class="danger-level" aria-label="Danger level: ${county.dangerLevel}">${county.dangerLevel}</div>
      <div class="weather-stat" aria-label="Temperature: ${county.temp} degrees Fahrenheit">
        🌡️ <strong>Temperature</strong><br>${county.temp}°F
      </div>
      <div class="weather-stat" aria-label="Humidity: ${county.humidity} percent">
        💧 <strong>Humidity</strong><br>${county.humidity}%
      </div>
      <div class="weather-stat" aria-label="Wind: ${county.wind}">
        💨 <strong>Wind</strong><br>${county.wind}
      </div>
    `;

    cardsContainer.appendChild(card);
  });

  console.log(`Generated ${COUNTIES_DATA.length} county cards`);
}

// Initialize Leaflet Map
function initializeMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('Map element not found!');
    return;
  }

  // Calculate center point of all counties
  const avgLat = COUNTIES_DATA.reduce((sum, c) => sum + c.lat, 0) / COUNTIES_DATA.length;
  const avgLon = COUNTIES_DATA.reduce((sum, c) => sum + c.lon, 0) / COUNTIES_DATA.length;

  // Initialize map
  const map = L.map('map', {
    center: [avgLat, avgLon],
    zoom: 9,
    zoomControl: true
  });

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Add markers for each county
  COUNTIES_DATA.forEach(county => {
    const dangerClass = getDangerClass(county.dangerLevel);
    let markerColor = 'green';
    
    if (dangerClass === 'danger-high') markerColor = 'red';
    else if (dangerClass === 'danger-moderate') markerColor = 'orange';

    const marker = L.circleMarker([county.lat, county.lon], {
      radius: 8,
      fillColor: markerColor,
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup(`
      <strong>${county.name}</strong><br>
      <strong>${county.dangerLevel}</strong><br>
      Temp: ${county.temp}°F<br>
      Humidity: ${county.humidity}%<br>
      Wind: ${county.wind}
    `);
  });

  console.log('Map initialized with county markers');
}

// Update last updated timestamp
function updateTimestamp() {
  const lastUpdateElement = document.getElementById('lastUpdate');
  if (lastUpdateElement) {
    const now = new Date();
    lastUpdateElement.textContent = now.toLocaleString();
  }
}

// Initialize dashboard when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    generateCountyCards();
    initializeMap();
    updateTimestamp();
  });
} else {
  // DOM already loaded
  generateCountyCards();
  initializeMap();
  updateTimestamp();
}

console.log('Dashboard initialization complete!');
