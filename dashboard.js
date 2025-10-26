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
    humidity: 50,
    wind: '7 mph S',
    dangerLevel: 'LOW DANGER'
  },
  {
    name: 'Lunenburg County',
    lat: 36.9618,
    lon: -78.2694,
    temp: 74,
    humidity: 38,
    wind: '12 mph SW',
    dangerLevel: 'HIGH DANGER'
  },
  {
    name: 'Mecklenburg County',
    lat: 36.7050,
    lon: -78.3214,
    temp: 71,
    humidity: 48,
    wind: '6 mph S',
    dangerLevel: 'MODERATE DANGER'
  },
  {
    name: 'Nottoway County',
    lat: 37.1332,
    lon: -78.0714,
    temp: 72,
    humidity: 46,
    wind: '9 mph SW',
    dangerLevel: 'MODERATE DANGER'
  },
  {
    name: 'Sussex County',
    lat: 36.9168,
    lon: -77.2913,
    temp: 70,
    humidity: 52,
    wind: '5 mph S',
    dangerLevel: 'LOW DANGER'
  }
];

// NASA FIRMS hotspot data (simulated for demonstration)
// In production, this would be fetched from NASA FIRMS API
const HOTSPOT_DATA = [];

// Function to count hotspots per county
function countHotspotsPerCounty() {
  const hotspotCounts = {};
  
  // Initialize counts for all counties
  COUNTIES_DATA.forEach(county => {
    hotspotCounts[county.name] = 0;
  });
  
  // Count hotspots within each county (using simple distance calculation)
  HOTSPOT_DATA.forEach(hotspot => {
    let nearestCounty = null;
    let minDistance = Infinity;
    
    COUNTIES_DATA.forEach(county => {
      // Simple distance calculation (in degrees)
      const distance = Math.sqrt(
        Math.pow(county.lat - hotspot.lat, 2) + 
        Math.pow(county.lon - hotspot.lon, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCounty = county.name;
      }
    });
    
    // If hotspot is within reasonable distance (< 0.5 degrees ≈ 35 miles)
    if (minDistance < 0.5 && nearestCounty) {
      hotspotCounts[nearestCounty]++;
    }
  });
  
  return hotspotCounts;
}

// Generate County Cards with Fire Information
function generateCards() {
  const cardsContainer = document.getElementById('cards');
  const hotspotCounts = countHotspotsPerCounty();
  
  COUNTIES_DATA.forEach(county => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `${county.name} Fire Weather Information`);
    
    // Get hotspot count for this county
    const hotspotCount = hotspotCounts[county.name] || 0;
    
    card.innerHTML = `
      <h2>${county.name}</h2>
      <div class="danger-badge ${county.dangerLevel.toLowerCase().replace(' ', '-')}">
        ${county.dangerLevel}
      </div>
      <div class="hotspot-count">
        <span class="fire-icon">🔥</span>
        <span class="count">${hotspotCount}</span>
        <span class="label">Active Hotspots</span>
      </div>
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
      <button class="forecast-link" data-county="${county.name}" aria-label="View detailed forecast for ${county.name}">
        View Detailed Forecast
      </button>
    `;
    
    cardsContainer.appendChild(card);
  });
}

// Initialize the map with county markers and fire data
function initMap() {
  const map = L.map('map').setView([37.0, -77.8], 9);
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);
  
  // Add markers for each county
  COUNTIES_DATA.forEach(county => {
    const marker = L.marker([county.lat, county.lon]).addTo(map);
    
    // Create popup content
    marker.bindPopup(`
      <div class="map-popup">
        <h3>${county.name}</h3>
        <p><strong>Danger Level:</strong> ${county.dangerLevel}</p>
        <p><strong>Temperature:</strong> ${county.temp}°F</p>
        <p><strong>Humidity:</strong> ${county.humidity}%</p>
        <p><strong>Wind:</strong> ${county.wind}</p>
      </div>
    `);
  });
}

// Update timestamp
function updateTimestamp() {
  const timestampElement = document.getElementById('timestamp');
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  timestampElement.textContent = `Last Updated: ${now.toLocaleDateString('en-US', options)}`;
}

// Initialize forecast modal
function initForecastModal() {
  const modal = document.getElementById('forecastModal');
  const closeBtn = document.querySelector('.close');
  const modalTitle = document.getElementById('modalCountyName');
  const modalContent = document.getElementById('modalForecastContent');
  
  // Add click event listeners to all forecast buttons
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('forecast-link')) {
      const countyName = e.target.getAttribute('data-county');
      const county = COUNTIES_DATA.find(c => c.name === countyName);
      
      if (county) {
        openModal(county);
      }
    }
  });
  
  function openModal(county) {
    modalTitle.textContent = county.name;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Load forecast data (simulated)
    loadForecastData(county);
  }
  
  async function loadForecastData(county) {
    modalContent.innerHTML = '<div class="loading">Loading forecast data...</div>';
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // In production, this would fetch from NWS API
      // https://api.weather.gov/points/{lat},{lon}
      
      modalContent.innerHTML = `
        <div class="forecast-section">
          <h3>7-Day Fire Weather Outlook</h3>
          <div class="forecast-days">
            <div class="forecast-day">
              <strong>Today</strong>
              <p>Temp: ${county.temp}°F</p>
              <p>Humidity: ${county.humidity}%</p>
              <p>Wind: ${county.wind}</p>
              <p class="danger ${county.dangerLevel.toLowerCase().replace(' ', '-')}">${county.dangerLevel}</p>
            </div>
            <div class="forecast-day">
              <strong>Tomorrow</strong>
              <p>Temp: ${county.temp + 2}°F</p>
              <p>Humidity: ${county.humidity - 5}%</p>
              <p>Wind: 10 mph SW</p>
              <p class="danger moderate-danger">MODERATE DANGER</p>
            </div>
            <div class="forecast-day">
              <strong>Day 3</strong>
              <p>Temp: ${county.temp + 5}°F</p>
              <p>Humidity: ${county.humidity - 10}%</p>
              <p>Wind: 15 mph W</p>
              <p class="danger high-danger">HIGH DANGER</p>
            </div>
          </div>
        </div>
        <div class="forecast-section">
          <h3>Fire Weather Watches & Warnings</h3>
          <p>No active watches or warnings for this area.</p>
        </div>
        <div class="forecast-section">
          <h3>Conditions</h3>
          <ul>
            <li>Dry conditions expected to continue</li>
            <li>Elevated fire danger through the week</li>
            <li>Wind gusts may reach 20 mph</li>
          </ul>
        </div>
      `;
    } catch (error) {
      modalContent.innerHTML = `
        <div class="error">
          Unable to load the forecast data. Please try again later.
          <small>Error: ${error.message}</small>
        </div>
      `;
    }
  }
  
  // Close modal when clicking the X button
  closeBtn.addEventListener('click', () => {
    closeModal();
  });
  
  // Close modal when clicking outside the modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });
  
  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Initialize dashboard
function init() {
  generateCards();
  initMap();
  updateTimestamp();
  initForecastModal();
}

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
