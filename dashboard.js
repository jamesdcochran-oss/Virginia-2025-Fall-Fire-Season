// Five Forks Fire Weather Dashboard - JavaScript
// Updated for Apple Weather-inspired design

console.log('🔥 Five Forks Fire Weather Dashboard Loaded');

// County coordinates
const COUNTIES = [
  { name: 'Amelia', lat: 37.3371, lon: -77.9778 },
  { name: 'Brunswick', lat: 36.7168, lon: -77.8500 },
  { name: 'Dinwiddie', lat: 37.0743, lon: -77.5830 },
  { name: 'Greensville', lat: 36.6821, lon: -77.5719 },
  { name: 'Nottoway', lat: 37.1329, lon: -78.0719 },
  { name: 'Prince George', lat: 37.2168, lon: -77.2861 }
];

// Mock weather data generator (replace with real API calls)
function generateMockWeather() {
  return {
    temp: Math.round(60 + Math.random() * 30),
    humidity: Math.round(30 + Math.random() * 40),
    dewPoint: Math.round(45 + Math.random() * 20),
    windSpeed: Math.round(3 + Math.random() * 12),
    windGust: Math.round(8 + Math.random() * 15)
  };
}

// Calculate fire danger class based on weather
function calculateDangerClass(temp, humidity, windSpeed) {
  const tempScore = Math.max(0, (temp - 50) / 50) * 10;
  const humidityScore = Math.max(0, (60 - humidity) / 60) * 6;
  const windScore = Math.min(windSpeed / 20, 1) * 6;
  const totalScore = Math.round(tempScore + humidityScore + windScore);

  if (totalScore >= 19) return { level: 'Class V', class: 'class-5' };
  if (totalScore >= 16) return { level: 'Class IV', class: 'class-4' };
  if (totalScore >= 12) return { level: 'Class III', class: 'class-3' };
  if (totalScore >= 9) return { level: 'Class II', class: 'class-2' };
  return { level: 'Class I', class: 'class-1' };
}

// Create county card HTML
function createCountyCard(county, weather) {
  const danger = calculateDangerClass(weather.temp, weather.humidity, weather.windSpeed);
  
  return `
    <div class="county-card">
      <div class="county-name">${county.name}</div>
      <div class="county-data">
        <div class="data-row">
          <span class="data-label">🌡️ Temp</span>
          <span class="data-value">${weather.temp}°F</span>
        </div>
        <div class="data-row">
          <span class="data-label">💧 RH</span>
          <span class="data-value">${weather.humidity}%</span>
        </div>
        <div class="data-row">
          <span class="data-label">💨 Dew Pt</span>
          <span class="data-value">${weather.dewPoint}°F</span>
        </div>
        <div class="data-row">
          <span class="data-label">🌬️ Wind</span>
          <span class="data-value">${weather.windSpeed} mph</span>
        </div>
        <div class="data-row">
          <span class="data-label">💨 Gust</span>
          <span class="data-value">${weather.windGust} mph</span>
        </div>
      </div>
      <div class="danger-class ${danger.class}">${danger.level}</div>
    </div>
  `;
}

/*
// Update main summary card
function updateMainCard() {
  const avgTemp = Math.round(60 + Math.random() * 30);
  const highTemp = avgTemp + Math.round(Math.random() * 10);
  const lowTemp = avgTemp - Math.round(Math.random() * 10);
  
  document.getElementById('mainTemp').textContent = `${avgTemp}°`;
  document.getElementById('mainCondition').textContent = 'Clear & Dry';
  document.getElementById('tempRange').textContent = `H:${highTemp}° L:${lowTemp}°`;
}
*/

// Load county cards
function loadCountyCards() {
  const grid = document.getElementById('countyGrid');
  if (!grid) return;
  
  grid.innerHTML = COUNTIES.map(county => {
    const weather = generateMockWeather();
    return createCountyCard(county, weather);
  }).join('');
}

// Update last update time
function updateLastUpdate() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const dateString = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  const lastUpdateEl = document.getElementById('lastUpdate');
  if (lastUpdateEl) {
    lastUpdateEl.textContent = `${dateString} at ${timeString}`;
  }
}

// Theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌗';
  });
}

// Refresh button functionality
function initRefreshButton() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (!refreshBtn) return;
  
  refreshBtn.addEventListener('click', () => {
    refreshBtn.style.animation = 'none';
    setTimeout(() => {
      refreshBtn.style.animation = '';
    }, 10);
    
    loadCountyCards();
    // updateMainCard();
    updateLastUpdate();
  });
}

// Initialize dashboard
function init() {
  console.log('Initializing dashboard...');
  
  // Load data
  // updateMainCard();
  loadCountyCards();
  updateLastUpdate();
  
  // Setup controls
  initThemeToggle();
  initRefreshButton();
  
  console.log('Dashboard initialized successfully!');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
