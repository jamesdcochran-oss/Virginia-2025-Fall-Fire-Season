// 🔥 Five Forks Fire Weather Dashboard Loaded
console.log("🔥 Five Forks Fire Weather Dashboard Loaded");

// ---- Geolocation banner helpers (user-friendly errors + fallback info) ----
function ensureBannerHost() {
  let host = document.getElementById('banner-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'banner-host';
    host.style.position = 'sticky';
    host.style.top = '0';
    host.style.zIndex = '1000';
    host.style.width = '100%';
    document.body.prepend(host);
  }
  return host;
}

function showBanner({ type = 'info', title = '', message = '', actions = [] }) {
  const host = ensureBannerHost();
  const wrap = document.createElement('div');
  wrap.setAttribute('role', 'status');
  wrap.style.padding = '12px 16px';
  wrap.style.display = 'flex';
  wrap.style.gap = '12px';
  wrap.style.alignItems = 'center';
  wrap.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  wrap.style.borderBottom = '1px solid rgba(0,0,0,.1)';
  wrap.style.background = type === 'error' ? '#fee2e2' : type === 'warning' ? '#fef3c7' : '#e0f2fe';
  wrap.style.color = '#111827';

  const strong = document.createElement('strong');
  strong.textContent = title;
  strong.style.marginRight = '4px';

  const span = document.createElement('span');
  span.textContent = message;

  const spacer = document.createElement('div');
  spacer.style.flex = '1';

  const actionsBox = document.createElement('div');
  actionsBox.style.display = 'flex';
  actionsBox.style.gap = '8px';

  actions.forEach(a => {
    const btn = document.createElement(a.href ? 'a' : 'button');
    if (a.href) btn.href = a.href;
    btn.textContent = a.label || 'Learn more';
    btn.style.padding = '6px 10px';
    btn.style.border = '1px solid rgba(0,0,0,.15)';
    btn.style.borderRadius = '6px';
    btn.style.background = '#ffffff';
    btn.style.color = '#111827';
    btn.style.textDecoration = 'none';
    btn.style.cursor = 'pointer';
    if (typeof a.onClick === 'function') btn.addEventListener('click', a.onClick);
    actionsBox.appendChild(btn);
  });

  const close = document.createElement('button');
  close.setAttribute('aria-label', 'Dismiss');
  close.textContent = '✕';
  close.style.border = 'none';
  close.style.background = 'transparent';
  close.style.cursor = 'pointer';
  close.style.fontSize = '16px';
  close.addEventListener('click', () => wrap.remove());

  wrap.appendChild(strong);
  wrap.appendChild(span);
  wrap.appendChild(spacer);
  wrap.appendChild(actionsBox);
  wrap.appendChild(close);
  host.appendChild(wrap);

  return wrap;
}

function showLocationFallbackInfo() {
  // Visible info fallback when location can't be determined
  showBanner({
    type: 'warning',
    title: 'Location unavailable.',
    message: 'Showing regional fire weather for Six-County area. Enable location for hyper-local info.',
    actions: [
      { label: 'Retry', onClick: () => requestUserLocation(true) },
      { label: 'How to enable location', href: 'https://support.google.com/chrome/answer/142065' }
    ]
  });
}

// ---- Geolocation request with robust error handling ----
function requestUserLocation(isRetry = false) {
  if (!('geolocation' in navigator)) {
    showBanner({
      type: 'error',
      title: 'Geolocation not supported.',
      message: 'Your browser does not support location. Falling back to regional data.'
    });
    showLocationFallbackInfo();
    return Promise.resolve(null);
  }

  const geo = navigator.geolocation;
  return new Promise(resolve => {
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    geo.getCurrentPosition(
      pos => {
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      err => {
        let reason = 'Unable to determine your location.';
        if (err.code === 1) reason = 'Permission denied. Please allow location access.';
        else if (err.code === 2) reason = 'Position unavailable from your device.';
        else if (err.code === 3) reason = 'Timed out while requesting location.';

        showBanner({
          type: 'error',
          title: 'Location error.',
          message: `${reason} Falling back to regional data.`,
          actions: [
            { label: isRetry ? 'Try again' : 'Retry', onClick: () => requestUserLocation(true) }
          ]
        });
        showLocationFallbackInfo();
        resolve(null);
      },
      options
    );
  });
}

// --- 1. DEFINITIONS: SIX COUNTIES AND AREA POLYGON ---
// Coordinates pulled directly from the provided GeoJSON.
const counties = [
  { name: "Dinwiddie", lat: 37.02153, lon: -77.60261 },
  { name: "Amelia", lat: 37.32646, lon: -77.99537 },
  { name: "Nottoway", lat: 37.14824, lon: -78.03382 },
  { name: "Brunswick", lat: 36.78112, lon: -77.85049 },
  { name: "Greensville", lat: 36.64130, lon: -77.56347 },
  { name: "Prince George", lat: 37.18810, lon: -77.18101 }
];

// GeoJSON object for the large polygon boundary.
const areaPolygonGeoJSON = { /* existing polygon data unchanged for brevity */ };

// ... existing mapping, controls, data fetching, renderCard, showHotspotsOnMap, etc. ...

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

// Enhance map overlay to accept optional user location (safe no-op if ignored by existing code)
function showHotspotsOnMap(fireData, counties, weatherData, userLocation) {
  if (typeof window._showHotspotsOnMapImpl === 'function') {
    return window._showHotspotsOnMapImpl(fireData, counties, weatherData, userLocation);
  }
  // else assume original implementation already present elsewhere
}

// Kick off on load with geolocation + robust error handling
window.onload = async () => {
  const userLocation = await requestUserLocation(false);
  await refreshData(userLocation);
  setInterval(() => refreshData(userLocation), 3600000); // Refresh every hour
};
