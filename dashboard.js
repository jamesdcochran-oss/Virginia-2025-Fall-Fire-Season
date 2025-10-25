// 🔥 Five Forks Fire Weather Dashboard Loaded
console.log("🔥 Five Forks Fire Weather Dashboard Loaded");

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

/**
 * Show informational banner about fallback location
 */
function showLocationFallbackInfo() {
  showBanner({
    type: 'info',
    message: 'Showing data for Five Forks, VA region (geolocation not available or denied)',
    duration: 6000
  });
}

/**
 * Request user's geolocation with robust error handling
 * @param {boolean} force - Force re-request even if previously denied
 * @returns {Promise<Object|null>} User location {lat, lon} or null
 */
async function requestUserLocation(force = false) {
  if (!navigator.geolocation) {
    showBanner({
      type: 'warning',
      message: 'Geolocation is not supported by your browser. Showing default Five Forks region data.',
      duration: 6000
    });
    return null;
  }
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        showBanner({
          type: 'success',
          message: 'Successfully detected your location',
          duration: 3000
        });
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      (error) => {
        let message = 'Unable to detect your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += 'Location permission was denied. Showing default Five Forks region data.';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable. Showing default Five Forks region data.';
            break;
          case error.TIMEOUT:
            message += 'Location request timed out. Showing default Five Forks region data.';
            break;
          default:
            message += 'An unknown error occurred. Showing default Five Forks region data.';
        }
        showBanner({
          type: 'warning',
          message: message,
          duration: 7000
        });
        resolve(null);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}

// ========================
// CONFIGURABLE RESOURCE LINKS
// ========================

/**
 * Configurable array of fire weather resource links
 * Edit this array to add, remove, or modify resource links
 */
const FIRE_RESOURCES = [
  {
    title: 'VA Department of Forestry',
    url: 'https://www.dof.virginia.gov/',
    description: 'Official Virginia forestry information and fire reports'
  },
  {
    title: 'National Weather Service - Wakefield',
    url: 'https://www.weather.gov/akq/',
    description: 'Local weather forecasts and fire weather warnings'
  },
  {
    title: 'NOAA Fire Weather',
    url: 'https://www.spc.noaa.gov/products/fire_wx/',
    description: 'National fire weather outlook and forecasts'
  },
  {
    title: 'NASA FIRMS Fire Map',
    url: 'https://firms.modaps.eosdis.nasa.gov/map/',
    description: 'Real-time satellite fire detection mapping'
  },
  {
    title: 'AirNow Air Quality',
    url: 'https://www.airnow.gov/',
    description: 'Current air quality conditions and smoke forecasts'
  },
  {
    title: 'Virginia Burn Law',
    url: 'https://law.lis.virginia.gov/vacode/title10.1/chapter11/section10.1-1142/',
    description: 'Legal requirements for outdoor burning in Virginia'
  }
];

/**
 * Initialize and render resource links from the configurable array
 */
function initializeResourceLinks() {
  const container = document.getElementById('resource-links');
  
  if (!container) {
    console.warn('Resource links container not found');
    return;
  }
  
  // Clear existing content
  container.innerHTML = '';
  
  // Create link elements from configuration
  FIRE_RESOURCES.forEach(resource => {
    const link = document.createElement('a');
    link.href = resource.url;
    link.className = 'resource-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = resource.title;
    
    // Add title attribute with description for additional accessibility
    if (resource.description) {
      link.title = resource.description;
    }
    
    // Add ARIA label for screen readers
    link.setAttribute('aria-label', `${resource.title}: ${resource.description || 'Opens in new window'}`);
    
    container.appendChild(link);
  });
  
  console.log(`Initialized ${FIRE_RESOURCES.length} resource links`);
}

// ========================
// EXISTING FUNCTIONALITY
// ========================

// County data (unchanged)
const counties = [
  { name: "Chesterfield", lat: 37.37721, lon: -77.50443 },
  { name: "Dinwiddie", lat: 37.02153, lon: -77.60261 },
  { name: "Amelia", lat: 37.32646, lon: -77.99537 },
  { name: "Nottoway", lat: 37.14824, lon: -78.03382 },
  { name: "Brunswick", lat: 36.78112, lon: -77.85049 },
  { name: "Greensville", lat: 36.64130, lon: -77.56347 },
  { name: "Prince George", lat: 37.18810, lon: -77.18101 }
];

// GeoJSON object for the large polygon boundary (unchanged)
const areaPolygonGeoJSON = {
  /* existing polygon data unchanged for brevity */
};

// ... existing mapping, controls, data fetching, renderCard, etc. ...

/**
 * Refresh dashboard data with optional user location
 * @param {Object|null} userLocation - User's location {lat, lon} or null
 */
async function refreshData(userLocation = null) {
  // If we have userLocation, optionally adjust map focus or include a user marker later
  document.getElementById("cards").innerHTML = "";
  const fireData = await fetchHotspots();
  const weatherPromises = counties.map(county => fetchWeather(county));
  const weatherData = await Promise.all(weatherPromises);
  
  for (let i = 0; i < counties.length; i++) {
    const county = counties[i];
    const weather = weatherData[i];
    const hotspots = fireData.features.filter(f =>
      turf.booleanPointInPolygon(
        turf.point([f.geometry.coordinates[0], f.geometry.coordinates[1]]),
        turf.circle([county.lon, county.lat], 20, { units: 'kilometers' })
      )
    );
    renderCard(county, weather, hotspots.length);
  }
  
  showHotspotsOnMap(fireData, counties, weatherData, userLocation);
}

/**
 * Enhance map overlay to accept optional user location
 * (safe no-op if ignored by existing code)
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
 * - Initialize resource links
 * - Request geolocation with error handling
 * - Load and refresh data
 */
window.onload = async () => {
  console.log('Initializing Five Forks Fire Weather Dashboard...');
  
  // Initialize configurable resource links
  initializeResourceLinks();
  
  // Request user location with error handling
  const userLocation = await requestUserLocation(false);
  
  // Load initial data
  await refreshData(userLocation);
  
  // Refresh data every hour
  setInterval(() => refreshData(userLocation), 3600000);
  
  console.log('Dashboard initialization complete');
};
