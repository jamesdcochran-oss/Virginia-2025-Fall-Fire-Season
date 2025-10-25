// 🔥 Five Forks Fire Weather Dashboard - Enhanced Version
console.log("🔥 Five Forks Fire Weather Dashboard Loaded");

// ========================
// CONFIGURABLE COUNTY DATA
// ========================
const COUNTIES_DATA = [
  {
    name: 'Dinwiddie',
    state: 'VA',
    lat: 37.0743,
    lon: -77.5830,
    forecast: 'Moderate fire danger. Relative humidity 35%, winds SW 8 mph.'
  },
  {
    name: 'Prince George',
    state: 'VA',
    lat: 37.2196,
    lon: -77.2894,
    forecast: 'Low fire danger. Relative humidity 45%, winds SE 5 mph.'
  },
  {
    name: 'Chesterfield',
    state: 'VA',
    lat: 37.3771,
    lon: -77.5050,
    forecast: 'Moderate fire danger. Relative humidity 40%, winds S 6 mph.'
  },
  {
    name: 'Sussex',
    state: 'VA',
    lat: 36.9165,
    lon: -77.2894,
    forecast: 'High fire danger. Relative humidity 28%, winds SW 12 mph.'
  }
];

// ========================
// BANNER NOTIFICATION SYSTEM
// ========================
/**
 * Show a notification banner using the HTML notification-banner element
 * @param {Object} options - Banner options
 * @param {string} options.type - Banner type: 'error', 'success', 'info', or 'warning'
 * @param {string} options.message - Message to display
 * @param {number} options.duration - Auto-hide duration in ms (0 = manual close only)
 */
function showBanner({ type = 'info', message = '', duration = 5000 }) {
  const banner = document.getElementById('notification-banner');
  const bannerMessage = document.getElementById('banner-message');
  const bannerClose = document.getElementById('banner-close');
  
  if (!banner || !bannerMessage) {
    console.warn('Banner elements not found in DOM');
    return;
  }
  
  // Clear existing banner classes
  banner.className = 'banner';
  
  // Add type-specific class
  banner.classList.add(`banner-${type}`);
  
  // Set message
  bannerMessage.textContent = message;
  
  // Show banner
  banner.style.display = 'block';
  
  // Setup close button
  bannerClose.onclick = () => {
    banner.style.display = 'none';
  };
  
  // Auto-hide after duration if specified
  if (duration > 0) {
    setTimeout(() => {
      banner.style.display = 'none';
    }, duration);
  }
}

// ========================
// CONFIGURABLE RESOURCE LINKS
// ========================
const RESOURCE_LINKS = [
  {
    title: 'NWS Fire Weather',
    url: 'https://www.weather.gov/akq/',
    description: 'Official fire weather forecasts'
  },
  {
    title: 'VDOF Burn Permits',
    url: 'https://www.dof.virginia.gov/fire/burn-permits/',
    description: '4pm burn law & permits'
  },
  {
    title: 'NASA FIRMS',
    url: 'https://firms.modaps.eosdis.nasa.gov/map/',
    description: 'Real-time satellite fire detection'
  },
  {
    title: 'VA Fire Incidents',
    url: 'https://www.dof.virginia.gov/',
    description: 'State forestry updates'
  }
];

function initializeResourceLinks() {
  const container = document.getElementById('resource-links');
  if (!container) return;
  
  container.innerHTML = RESOURCE_LINKS.map(link => `
    <div class="resource-card">
      <h3><a href="${link.url}" target="_blank" rel="noopener">${link.title}</a></h3>
      <p>${link.description}</p>
    </div>
  `).join('');
}

// ========================
// DYNAMIC COUNTY CARD RENDERING
// ========================
/**
 * Render county cards dynamically from COUNTIES_DATA
 */
function renderCountyCards() {
  const cardsContainer = document.getElementById('cards');
  if (!cardsContainer) {
    console.warn('Cards container not found');
    return;
  }
  
  // Clear existing cards
  cardsContainer.innerHTML = '';
  
  // Render each county
  COUNTIES_DATA.forEach(county => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${county.name}, ${county.state}</h3>
      <p class="forecast">${county.forecast}</p>
      <p class="loading">Loading weather data...</p>
    `;
    cardsContainer.appendChild(card);
  });
}

/**
 * Update a specific county card with weather data
 */
function updateCountyCard(countyName, weather, hotspotCount) {
  const cardsContainer = document.getElementById('cards');
  if (!cardsContainer) return;
  
  const cards = cardsContainer.getElementsByClassName('card');
  for (let card of cards) {
    const h3 = card.querySelector('h3');
    if (h3 && h3.textContent.includes(countyName)) {
      const loadingP = card.querySelector('.loading');
      if (loadingP) {
        loadingP.remove();
      }
      
      // Add weather info
      const weatherP = document.createElement('p');
      weatherP.className = 'weather';
      weatherP.textContent = `🌡️ ${weather.temp}°F | 💧 ${weather.humidity}% | 💨 ${weather.windSpeed} mph`;
      card.appendChild(weatherP);
      
      // Add hotspot info
      const hotspotP = document.createElement('p');
      hotspotP.className = 'hotspots';
      hotspotP.textContent = `🔥 ${hotspotCount} active hotspot(s) nearby`;
      card.appendChild(hotspotP);
      
      break;
    }
  }
}

// ========================
// GEOLOCATION
// ========================
/**
 * Request user's location with error handling
 * @param {boolean} showError - Whether to show error banner
 * @returns {Promise<Object|null>} User location or null
 */
function requestUserLocation(showError = true) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      if (showError) {
        showBanner({
          type: 'warning',
          message: 'Geolocation not supported by your browser',
          duration: 7000
        });
      }
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        if (showError) {
          showBanner({
            type: 'info',
            message: 'Location access denied. Using default monitoring area.',
            duration: 5000
          });
        }
        resolve(null);
      }
    );
  });
}

// ========================
// WEATHER API
// ========================
/**
 * Fetch weather data for a location with error handling
 */
async function fetchWeather(lat, lon) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.current_weather) {
      throw new Error('Invalid weather data received');
    }
    
    return {
      temp: Math.round(data.current_weather.temperature * 9/5 + 32), // Convert C to F
      windSpeed: Math.round(data.current_weather.windspeed * 0.621371), // Convert km/h to mph
      humidity: data.hourly.relative_humidity_2m[0] || 50
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    showBanner({
      type: 'error',
      message: `Weather data unavailable: ${error.message}`,
      duration: 8000
    });
    // Return default values
    return {
      temp: 70,
      windSpeed: 5,
      humidity: 50
    };
  }
}

// ========================
// FIRE HOTSPOT API
// ========================
/**
 * Fetch fire hotspot data with error handling
 */
async function fetchFireHotspots() {
  try {
    const response = await fetch(
      'https://firms.modaps.eosdis.nasa.gov/api/area/csv/noaa-20-viirs/world/1/37.0743,-77.5830,36.8000,-77.0000'
    );
    
    if (!response.ok) {
      throw new Error(`Fire API returned status ${response.status}`);
    }
    
    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return { type: 'FeatureCollection', features: [] };
    }
    
    const headers = lines[0].split(',');
    const features = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 2) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(values[1]), parseFloat(values[0])]
          },
          properties: {
            brightness: values[2] || 'N/A',
            confidence: values[8] || 'N/A'
          }
        });
      }
    }
    
    return { type: 'FeatureCollection', features };
  } catch (error) {
    console.error('Fire hotspot fetch error:', error);
    showBanner({
      type: 'error',
      message: `Fire hotspot data unavailable: ${error.message}`,
      duration: 8000
    });
    return { type: 'FeatureCollection', features: [] };
  }
}

// ========================
// DATA REFRESH
// ========================
/**
 * Refresh all dashboard data
 */
async function refreshData(userLocation = null) {
  console.log('Refreshing dashboard data...');
  
  // Fetch fire hotspots
  const fireData = await fetchFireHotspots();
  
  // Fetch weather for each county and update cards
  for (const county of COUNTIES_DATA) {
    const weather = await fetchWeather(county.lat, county.lon);
    
    // Filter hotspots near this county (within 20km)
    const hotspots = fireData.features.filter(f => {
      if (typeof turf === 'undefined') return false;
      return turf.booleanWithin(
        turf.point([f.geometry.coordinates[0], f.geometry.coordinates[1]]),
        turf.circle([county.lon, county.lat], 20, { units: 'kilometers' })
      );
    });
    
    updateCountyCard(county.name, weather, hotspots.length);
  }
  
  showHotspotsOnMap(fireData, COUNTIES_DATA, null, userLocation);
}

/**
 * Enhance map overlay to accept optional user location
 */
function showHotspotsOnMap(fireData, counties, weatherData, userLocation) {
  if (typeof window._showHotspotsOnMapImpl === 'function') {
    return window._showHotspotsOnMapImpl(fireData, counties, weatherData, userLocation);
  }
  // else assume original implementation already present elsewhere
}

// ========================
// INITIALIZATION
// ========================
/**
 * Initialize dashboard on page load
 */
window.onload = async () => {
  console.log('Initializing Five Forks Fire Weather Dashboard...');
  
  // Initialize configurable resource links
  initializeResourceLinks();
  
  // Render county cards dynamically
  renderCountyCards();
  
  // Request user location with error handling
  const userLocation = await requestUserLocation(false);
  
  // Load initial data
  await refreshData(userLocation);
  
  // Refresh data every hour
  setInterval(() => refreshData(userLocation), 3600000);
  
  console.log('Dashboard initialization complete');
};
