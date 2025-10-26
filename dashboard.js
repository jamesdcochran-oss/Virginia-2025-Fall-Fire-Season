// dashboard.js - Five Forks Fire Weather Dashboard
console.log('🔥 Five Forks Fire Weather Dashboard Loaded - Live Data Mode');
// County coordinates (static, as these don't change)
const COUNTY_COORDS = [
  { name: 'Amelia County', lat: 37.3371, lon: -77.9778 },
  { name: 'Brunswick County', lat: 36.7168, lon: -77.8500 },
  { name: 'Dinwiddie County', lat: 37.0743, lon: -77.5830 },
  { name: 'Greensville County', lat: 36.6821, lon: -77.5719 },
  { name: 'Lunenburg County', lat: 36.9612, lon: -78.2689 },
  { name: 'Mecklenburg County', lat: 36.6976, lon: -78.3261 },
  { name: 'Nottoway County', lat: 37.1329, lon: -78.0719 },
  { name: 'Prince George County', lat: 37.2168, lon: -77.2861 },
  { name: 'Southampton County', lat: 36.7174, lon: -77.0897 },
  { name: 'Surry County', lat: 37.1343, lon: -76.8344 },
  { name: 'Sussex County', lat: 36.9243, lon: -77.2897 }
];
// Live data cache (refreshed on every load)
let liveCountyData = [];
let firmsData = [];
// Fire danger calculation based on live weather conditions
function calculateFireDanger(temp, humidity, windSpeed) {
  // Base heuristic score: higher temp, lower RH, higher wind => higher danger
  const tempScore = Math.max(0, (temp - 50) / 50) * 10; // 0-10
  const humidityScore = Math.max(0, (60 - humidity) / 60) * 6; // 0-6
  const windScore = Math.min(windSpeed / 20, 1) * 6; // 0-6
  const totalScore = Math.round(tempScore + humidityScore + windScore); // 0-22 approx

  // Map to VA DOF Readiness Levels and colors
  if (totalScore >= 19) return { level: 'V (Extreme)', class: 'extreme', color: 'red' };
  if (totalScore >= 16) return { level: 'IV (Very High)', class: 'very-high', color: 'orange' };
  if (totalScore >= 12) return { level: 'III (High)', class: 'high', color: 'yellow' };
  if (totalScore >= 9)  return { level: 'II (Moderate)', class: 'moderate', color: 'green' };
  return { level: 'I (Low)', class: 'low', color: 'blue' };
}
// Fetch live weather data from NWS for a specific county
async function fetchNWSWeather(lat, lon, countyName) {
  try {
    console.log(`🌦️ Fetching live NWS data for ${countyName}...`);
    // Step 1: Get the NWS gridpoint from coordinates
    const pointsUrl = `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
    const pointsResponse = await fetch(pointsUrl, {
      headers: { 'User-Agent': '(FireWeatherDashboard, contact@example.com)' }
    });
    if (!pointsResponse.ok) throw new Error(`Points API failed: ${pointsResponse.status}`);
    const pointsData = await pointsResponse.json();
    const forecastUrl = pointsData.properties.forecast;

    // Step 2: Get the forecast data
    const forecastResponse = await fetch(forecastUrl, {
      headers: { 'User-Agent': '(FireWeatherDashboard, contact@example.com)' }
    });
    if (!forecastResponse.ok) throw new Error(`Forecast API failed: ${forecastResponse.status}`);

    const forecastData = await forecastResponse.json();
    const currentPeriod = forecastData.properties.periods[0];

    // Extract weather values
    const temp = currentPeriod.temperature;
    const humidity = currentPeriod.relativeHumidity?.value || 50;
    const windSpeedStr = currentPeriod.windSpeed;
    const windDir = currentPeriod.windDirection;

    // Parse wind speed (handles "10 mph" or "5 to 10 mph")
    const windMatch = windSpeedStr.match(/(\d+)/);
    const windSpeed = windMatch ? parseInt(windMatch[1]) : 5;
    const windDisplay = `${windSpeed} mph ${windDir}`;

    // Calculate fire danger from live data
    const danger = calculateFireDanger(temp, humidity, windSpeed);

    return {
      name: countyName,
      lat,
      lon,
      temp,
      humidity,
      wind: windDisplay,
      windSpeed,
      dangerLevel: danger.level,
      dangerClass: danger.class,
      dangerColor: danger.color,
      lastUpdate: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error fetching weather for ${countyName}:`, error);
    // Return fallback with clear indication of fetch failure
    return {
      name: countyName,
      lat,
      lon,
      temp: null,
      humidity: null,
      wind: 'Data unavailable',
      windSpeed: 0,
      dangerLevel: 'DATA UNAVAILABLE',
      dangerClass: 'unavailable',
      dangerColor: '#808080',
      error: true,
      lastUpdate: new Date().toISOString()
    };
  }
}
// Fetch NASA FIRMS fire data
async function fetchNASAFIRMS() {
  try {
    console.log('🛰️ Fetching live NASA FIRMS fire data...');
    const region = 'USA_contiguous_and_Hawaii';
    const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/VIIRS_SNPP_NRT/${region}/1`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`FIRMS API failed: ${response.status}`);
    const csvText = await response.text();
    const lines = csvText.split('\n').slice(1); // Skip header

    // Parse CSV and filter for Virginia region (approximate bounding box)
    const vaFires = lines
      .map(line => {
        const parts = line.split(',');
        if (parts.length < 10) return null;
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        const brightness = parseFloat(parts[2]);
        const confidence = parts[8];
        // Virginia bounding box: ~36.0-38.5 N, -79.0 to -75.5 W
        if (lat >= 36.0 && lat <= 38.5 && lon >= -79.0 && lon <= -75.5) {
          return { lat, lon, brightness, confidence };
        }
        return null;
      })
      .filter(f => f !== null);

    console.log(`🔥 Found ${vaFires.length} active fires in region`);
    return vaFires;
  } catch (error) {
    console.error('❌ Error fetching FIRMS data:', error);
    return [];
  }
}
// Initialize the dashboard with live data
async function initDashboard() {
  console.log('🚀 Initializing dashboard with 100% live data...');
  // Show loading state
  const container = document.getElementById('county-cards') || document.getElementById('cards');
  if (container) {
    container.innerHTML = '<div class="loading">⏳ Fetching live weather data from NWS...</div>';
  }
  // Fetch live weather for all counties in parallel
  const weatherPromises = COUNTY_COORDS.map(county => fetchNWSWeather(county.lat, county.lon, county.name));
  liveCountyData = await Promise.all(weatherPromises);
  console.log('✅ All county weather data fetched:', liveCountyData);

  // Fetch NASA FIRMS fire data
  firmsData = await fetchNASAFIRMS();

  // Render the UI with live data
  renderCountyCards();
  initializeMap();
  console.log('✅ Dashboard initialized with live data');
}
// Render county cards from live data
function renderCountyCards() {
  const container = document.getElementById('county-cards') || document.getElementById('cards');
  if (!container) return;
  container.innerHTML = '';
  liveCountyData.forEach(county => {
    const card = document.createElement('div');
    card.className = 'county-card';
    card.setAttribute('data-county', county.name);
    const tempDisplay = county.temp !== null ? `${county.temp}°F` : 'N/A';
    const humidityDisplay = county.humidity !== null ? `${Math.round(county.humidity)}%` : 'N/A';
    card.innerHTML = `
      <div class="county-header">
        ${county.name}
        <span class="danger-badge ${county.dangerClass}" style="background-color: ${county.dangerColor}">
          ${county.dangerLevel}
        </span>
      </div>
      <div class="weather-info">
        <div class="weather-item">
          <span class="label">🌡️ Temp:</span>
          <span class="value">${tempDisplay}</span>
        </div>
        <div class="weather-item">
          <span class="label">💧 Humidity:</span>
          <span class="value">${humidityDisplay}</span>
        </div>
        <div class="weather-item">
          <span class="label">💨 Wind:</span>
          <span class="value">${county.wind}</span>
        </div>
        <div class="update-time">
          Last updated: ${new Date(county.lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
// Initialize Leaflet map with live fire data
function initializeMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;
  // Initialize map centered on Virginia
  const map = L.map('map').setView([37.0, -77.5], 8);
  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);
  // Add county markers with live danger levels
  liveCountyData.forEach(county => {
    if (county.lat && county.lon) {
      const marker = L.circleMarker([county.lat, county.lon], {
        radius: 10,
        fillColor: county.dangerColor,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      }).addTo(map);
      const tempDisplay = county.temp !== null ? `${county.temp}°F` : 'N/A';
      const humidityDisplay = county.humidity !== null ? `${Math.round(county.humidity)}%` : 'N/A';
      marker.bindPopup(`
        ${county.name}<br/>
        🌡️ ${tempDisplay}<br/>
        💧 ${humidityDisplay}<br/>
        💨 ${county.wind}<br/>
        <span style="color: ${county.dangerColor}; font-weight: bold;">${county.dangerLevel}</span>
      `);
    }
  });
  // Add NASA FIRMS fire markers
  firmsData.forEach(fire => {
    L.circleMarker([fire.lat, fire.lon], {
      radius: 5,
      fillColor: '#FF0000',
      color: '#8B0000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map)
    .bindPopup(`
      🔥 Active Fire<br/>
      Brightness: ${fire.brightness}K<br/>
      Confidence: ${fire.confidence}
    `);
  });
  console.log('🗺️ Map initialized with live overlays');
}
// Force refresh on page visibility change
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('🔄 Page became visible - refreshing data...');
    initDashboard();
  }
});
// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
// Expose refresh function for manual triggers
window.refreshDashboard = initDashboard;
console.log('✅ Dashboard script loaded - all data will be fetched live on every load');
