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

// Initialize the dashboard when DOM is ready
function initDashboard() {
  console.log('Initializing Dashboard...');
  const container = document.getElementById('counties-container');
  
  if (!container) {
    console.error('Counties container not found!');
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
}

// Create a county card element
function createCountyCard(county) {
  const card = document.createElement('div');
  const dangerClass = getDangerClass(county.dangerLevel);
  card.className = `county-card ${dangerClass}`;

  card.innerHTML = `
    <h2>${county.name}</h2>
    <div class="weather-info">
      <div class="weather-item">
        <span class="label">Temperature:</span>
        <span class="value">${county.temp}°F</span>
      </div>
      <div class="weather-item">
        <span class="label">Humidity:</span>
        <span class="value">${county.humidity}%</span>
      </div>
      <div class="weather-item">
        <span class="label">Wind:</span>
        <span class="value">${county.wind}</span>
      </div>
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
