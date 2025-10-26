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
    wind: '6 mph S',
    dangerLevel: 'LOW DANGER'
  },
  {
    name: 'Nottoway County',
    lat: 37.1332,
    lon: -77.9889,
    temp: 74,
    humidity: 40,
    wind: '12 mph SW',
    dangerLevel: 'HIGH DANGER'
  },
  {
    name: 'Prince George County',
    lat: 37.2193,
    lon: -77.2903,
    temp: 73,
    humidity: 43,
    wind: '9 mph SW',
    dangerLevel: 'MODERATE DANGER'
  }
];

// Helper function to get danger color based on level
function getDangerColor(dangerLevel) {
  const level = dangerLevel.toUpperCase();
  if (level.includes('LOW')) return '#007bff';      // Blue
  if (level.includes('MODERATE')) return '#28a745'; // Green
  if (level.includes('HIGH')) return '#ffc107';     // Yellow
  if (level.includes('VERY HIGH')) return '#fd7e14'; // Orange
  if (level.includes('EXTREME')) return '#dc3545';  // Red
  return '#6c757d'; // Default gray
}

// Render County Cards
function renderCountyCards() {
  const container = document.getElementById('county-cards');
  if (!container) return;
  
  container.innerHTML = COUNTIES_DATA.map(county => {
    const dangerColor = getDangerColor(county.dangerLevel);
    return `
      <div class="county-card">
        <div class="county-header">
          <h3>${county.name}</h3>
          <span class="danger-badge" style="background-color: ${dangerColor}; color: white;">${county.dangerLevel}</span>
        </div>
        <div class="weather-info">
          <div class="weather-stat">
            <span class="weather-label">🌡️ Temperature:</span>
            <span class="weather-value">${county.temp}°F</span>
          </div>
          <div class="weather-stat">
            <span class="weather-label">💧 Humidity:</span>
            <span class="weather-value">${county.humidity}%</span>
          </div>
          <div class="weather-stat">
            <span class="weather-label">💨 Wind:</span>
            <span class="weather-value">${county.wind}</span>
          </div>
        </div>
        <div class="county-actions">
          <button onclick="viewForecast('${county.name}', ${county.lat}, ${county.lon})" class="forecast-btn">View 7-Day Forecast</button>
        </div>
      </div>
    `;
  }).join('');
}

// View Forecast Function
function viewForecast(countyName, lat, lon) {
  localStorage.setItem('selectedCounty', JSON.stringify({ name: countyName, lat, lon }));
  window.location.href = 'forecast.html';
}

// Initialize Dashboard
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderCountyCards);
} else {
  renderCountyCards();
}
