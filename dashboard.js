// dashboard.js - Five Forks Fire Weather Dashboard
console.log('🔥 Five Forks Fire Weather Dashboard Loaded - Live Data Mode');

// County coordinates (static, as these don't change) - ONLY TARGET COUNTIES
const COUNTY_COORDS = [
  { name: 'Amelia County', lat: 37.3371, lon: -77.9778 },
  { name: 'Brunswick County', lat: 36.7168, lon: -77.8500 },
  { name: 'Dinwiddie County', lat: 37.0743, lon: -77.5830 },
  { name: 'Greensville County', lat: 36.6821, lon: -77.5719 },
  { name: 'Nottoway County', lat: 37.1329, lon: -78.0719 },
  { name: 'Prince George County', lat: 37.2168, lon: -77.2861 }
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
    return { level: 'I (Low)', class: 'low', color: 'cyan';}

// === Fosberg Fire Weather Index (FFWI) implementation ===
// Compute Equilibrium Moisture Content (EMC) using Simard (1968) piecewise
function calculateEMC(tempF, rh) {
  // Convert temperature to Fahrenheit if not provided; expecting Fahrenheit input.
  const T = tempF;
  const RH = rh;
  if (RH < 10) {
    // Low humidity regime
    return 0.03229 + 0.281073 * RH - 0.000578 * RH * T;
  } else if (RH < 50) {
    // Moderate humidity regime
    return 2.22749 + 0.160107 * RH - 0.014784 * T;
  } else {
    // High humidity regime
    return 21.0606 + 0.005565 * RH * RH - 0.00035 * RH * T - 0.483199 * RH;
  }
}

// Moisture damping coefficient: scales from 1 (very dry) to 0 (very moist)
function calculateEta(m) {
  let eta = 1 - (m / 30);
  // Clamp between 0 and 1
  if (eta < 0) eta = 0;
  if (eta > 1) eta = 1;
  return eta;
}

// Compute Fosberg Fire Weather Index given temperature (F), relative humidity (%), and wind speed (mph)
function calculateFFWI(tempF, rh, windSpeed) {
  const m = calculateEMC(tempF, rh);
  const eta = calculateEta(m);
  const U = windSpeed;
  const ffwi = eta * Math.sqrt(1 + U * U) / 0.3002;
  return ffwi;
}

// Categorize FFWI into adjective classes with color coding
function classifyFFWI(ffwi) {
  if (ffwi >= 80) return { label: 'Extreme', class: 'extreme', color: 'red' };
  if (ffwi >= 50) return { label: 'Very High', class: 'very-high', color: 'orange' };
  if (ffwi >= 25) return { label: 'High', class: 'high', color: 'yellow' };
  if (ffwi >= 12) return { label: 'Moderate', class: 'moderate', color: 'green' };
  return { label: 'Low', class: 'low', color: 'blue' };
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
    
    if (!pointsResponse.ok) throw new Error(`NWS points API error: ${pointsResponse.status}`);
    const pointsData = await pointsResponse.json();
    const forecastUrl = pointsData.properties.forecast;

            // Step 2: Fetch the hourly forecast
            const forecastResponse = await fetch(forecastUrl, {
                  headers: { 'User-Agent': '(FireWeatherDashboard, contact@example.com)' }
                      });
    
    
    if (!forecastResponse.ok) throw new Error(`NWS forecast API error: ${forecastResponse.status}`);
    const forecastData = await forecastResponse.json();
    const current = forecastData.properties.periods[0];

    // Extract live weather data
    const temp = current.temperature;
    const humidity = current.relativeHumidity?.value || 50;
    const windSpeed = parseInt(current.windSpeed) || 0;
    const windDir = current.windDirection || 'N';

    // Calculate fire danger using live data
    const danger = calculateFireDanger(temp, humidity, windSpeed);
    // Calculate Fosberg Fire Weather Index (FFWI)
    const ffwiRaw = calculateFFWI(temp, humidity, windSpeed);
    const ffwiInfo = classifyFFWI(ffwiRaw);

    return {
      name: countyName,
      temp,
      humidity,
      wind: `${windSpeed} mph ${windDir}`,
      dangerLevel: danger.level,
      dangerClass: danger.class,
      dangerColor: danger.color,
      ffwi: Math.round(ffwiRaw),
      ffwiLevel: ffwiInfo.label,
      ffwiClass: ffwiInfo.class,
      ffwiColor: ffwiInfo.color,
      lat,
      lon
    };
  } catch (error) {
    console.error(`❌ Error fetching NWS data for ${countyName}:`, error);
    return {
      name: countyName,
      temp: null,
      humidity: null,
      wind: 'N/A',
      dangerLevel: 'Data Unavailable',
      dangerClass: 'low',
      dangerColor: 'gray',
      ffwi: null,
      ffwiLevel: 'N/A',
      ffwiClass: 'low',
      ffwiColor: 'gray',
      lat,
      lon
    };
  }
}

// Fetch active fires from NASA FIRMS
async function fetchFIRMSData() {
  try {
    console.log('🔥 Fetching NASA FIRMS active fire data...');
    const url = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/c6331533b26e8aaf5f8e6f19f1c4061c/VIIRS_SNPP_NRT/USA_contiguous/1';
    const response = await fetch(url);
    const csvText = await response.text();
;
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    const fires = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const lat = parseFloat(values[0]);
      const lon = parseFloat(values[1]);
      const brightness = parseFloat(values[2]);
      const confidence = values[9];
      
      // Filter for Virginia region (approximate)
      if (lat >= 36.5 && lat <= 37.5 && lon >= -78.5 && lon <= -76.5) {
        fires.push({ lat, lon, brightness, confidence });
      }
    }
    
    console.log(`🔥 Found ${fires.length} active fires in region`);
    return fires;
  } catch (error) {
    console.error('❌ Error fetching FIRMS data:', error);
    return [];
  }
}

// Main initialization function - fetches ALL data fresh every time
async function initDashboard() {
  console.log('🔄 Loading fresh data for all counties...');
  
  // Clear old data
  liveCountyData = [];
    //   firmsData = [];
  
  // Fetch live weather for all counties in parallel
  const weatherPromises = COUNTY_COORDS.map(county => 
    fetchNWSWeather(county.lat, county.lon, county.name)
  );
  
  liveCountyData = await Promise.all(weatherPromises);
  console.log('✅ Live county data loaded:', liveCountyData);
  
      // // Fetch active fires
    //   firmsData = await fetchFIRMSData();
  
  // Render the dashboard
  renderDashboard();
  renderMap();
  
  // Update last update timestamp for display
  const lastUpdateEl = document.getElementById('lastUpdate');
  if (lastUpdateEl) {
    const now = new Date();
    lastUpdateEl.textContent = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  }
}

// Render county cards
function renderDashboard() {
  const container = document.getElementById('counties-container');
  if (!container) return;
  
  container.innerHTML = liveCountyData.map(county => {
    const tempDisplay = county.temp !== null ? `${county.temp}°F` : 'N/A';
    const humidityDisplay = county.humidity !== null ? `${Math.round(county.humidity)}%` : 'N/A';
    
    return `
      <div class="county-card ${county.dangerClass}">
        <h3>${county.name}</h3>
        <div class="weather-info">
          <p>🌡️ ${tempDisplay}</p>
          <p>💧 ${humidityDisplay}</p>
          <p>💨 ${county.wind}</p>
          <p>🔥 FFWI: <span style="color: ${county.ffwiColor}; font-weight: bold;">${county.ffwi !== null ? county.ffwi : 'N/A'}${county.ffwiLevel !== 'N/A' ? ' (' + county.ffwiLevel + ')' : ''}</span></p>
        </div>
        <div class="danger-badge ${county.dangerClass}" style="background-color: ${county.dangerColor};">
          ${county.dangerLevel}
        </div>
      </div>
    `;
  }).join('');
  
  console.log('✅ Dashboard cards rendered');
}

// Render interactive map with live overlays
function renderMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement || typeof L === 'undefined') return;
  
  // Clear existing map
  mapElement.innerHTML = '';
  
  // Initialize map centered on region
  const map = L.map('map').setView([37.0, -77.5], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  
  // Add county markers with fire danger colors
  liveCountyData.forEach(county => {
    if (county.lat && county.lon) {
      const marker = L.circleMarker([county.lat, county.lon], {
        radius: 15,
        fillColor: county.dangerColor,
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7
      }).addTo(map);
      
      const tempDisplay = county.temp !== null ? `${county.temp}°F` : 'N/A';
      const humidityDisplay = county.humidity !== null ? `${Math.round(county.humidity)}%` : 'N/A';
      
      marker.bindPopup(`
        <strong>${county.name}</strong><br>
        🌡️ ${tempDisplay}<br>
        💧 ${humidityDisplay}<br>
        💨 ${county.wind}<br>
        🔥 FFWI: <span style="color: ${county.ffwiColor}; font-weight: bold;">${county.ffwi !== null ? county.ffwi : 'N/A'}${county.ffwiLevel !== 'N/A' ? ' (' + county.ffwiLevel + ')' : ''}</span><br>
        <span style="color: ${county.dangerColor}; font-weight: bold;">${county.dangerLevel}</span>
      `);
    }
  });
  
      /* // Add NASA FIRMS fire markers
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
      🔥 Active Fire<br>
      Brightness: ${fire.brightness}K<br>
      Confidence: ${fire.confidence}
    `); */
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
