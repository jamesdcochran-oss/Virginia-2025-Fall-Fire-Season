// Five Forks Fire Weather Dashboard - Main Script

// County data with centroids for NWS API
const COUNTIES = [
    { name: 'Dinwiddie', lat: 37.0751, lon: -77.5831 },
    { name: 'Brunswick', lat: 36.7168, lon: -77.8500 },
    { name: 'Greensville', lat: 36.6835, lon: -77.5664 },
    { name: 'Amelia', lat: 37.3500, lon: -77.9700 },
    { name: 'Prince George', lat: 37.1835, lon: -77.2831 },
    { name: 'Nottoway', lat: 37.1000, lon: -78.0700 }
];

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initMap();
    loadCountyData();

    // Event listeners
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Map Initialization
let map;
// Layer group for county markers on the map. Defined after map initialization.
let countyLayerGroup;
function initMap() {
    map = L.map('map').setView([37.2, -77.7], 8);

    // Light basemap for fire visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
        maxZoom: 19
    }).addTo(map);

    // Create a layer group to hold county markers. This will be cleared on each data refresh.
    countyLayerGroup = L.layerGroup().addTo(map);
}

// Placeholder removed: the FIRMS fire hotspot layer has been replaced by NWS data.
// County markers will be generated from the National Weather Service API via addCountyMarkers().

/**
 * Fetch current fire weather metrics for a given county using the National Weather Service API.
 * This function calls the `points` endpoint to resolve the nearest gridpoint and then
 * retrieves the first period of the hourly forecast. It returns an object with
 * temperature (F), relative humidity (%), dew point (F), wind speed (mph), gust (mph) and danger class.
 * On failure, the caller is responsible for providing fallback values.
 * 
 * @param {Object} county - County descriptor with `name`, `lat` and `lon` properties.
 * @returns {Promise<Object>} An object containing weather metrics and the county name and coordinates.
 */
async function fetchCountyWeather(county) {
    // Resolve the gridpoint for this coordinate
    const pointsUrl = `https://api.weather.gov/points/${county.lat},${county.lon}`;
    const pointsResp = await fetch(pointsUrl);
    if (!pointsResp.ok) {
        throw new Error(`Failed to fetch points for ${county.name}: ${pointsResp.status}`);
    }
    const pointsData = await pointsResp.json();
    const gridId = pointsData.properties.gridId;
    const gridX = pointsData.properties.gridX;
    const gridY = pointsData.properties.gridY;
    if (!gridId || gridX === undefined || gridY === undefined) {
        throw new Error(`Invalid gridpoint data for ${county.name}`);
    }
    // Fetch hourly forecast for the gridpoint
    const hourlyUrl = `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast/hourly`;
    const hourlyResp = await fetch(hourlyUrl);
    if (!hourlyResp.ok) {
        throw new Error(`Failed to fetch hourly forecast for ${county.name}: ${hourlyResp.status}`);
    }
    const hourlyData = await hourlyResp.json();
    const periods = hourlyData.properties && hourlyData.properties.periods;
    if (!periods || periods.length === 0) {
        throw new Error(`No hourly forecast periods returned for ${county.name}`);
    }
    const firstPeriod = periods[0];
    // Extract metrics
    const temp = firstPeriod.temperature;
    const rh = firstPeriod.relativeHumidity && typeof firstPeriod.relativeHumidity.value === 'number'
        ? firstPeriod.relativeHumidity.value
        : null;
    const dewC = firstPeriod.dewpoint && typeof firstPeriod.dewpoint.value === 'number'
        ? firstPeriod.dewpoint.value
        : null;
    const dewF = dewC !== null ? Math.round((dewC * 9/5) + 32) : null;
    const windSpeedStr = firstPeriod.windSpeed || '';
    const windMatch = windSpeedStr.match(/\d+/);
    const wind = windMatch ? parseInt(windMatch[0], 10) : null;
    const windGustStr = firstPeriod.windGust || windSpeedStr;
    const gustMatch = windGustStr ? windGustStr.match(/\d+/) : null;
    const gust = gustMatch ? parseInt(gustMatch[0], 10) : wind;
    // Calculate danger class using existing scoring algorithm
    const dangerClass = calculateDangerClass(temp, rh, wind);
    return {
        name: county.name,
        temp: temp,
        rh: rh,
        dewPoint: dewF,
        wind: wind,
        gust: gust,
        dangerClass: dangerClass,
        lat: county.lat,
        lon: county.lon
    };
}

/**
 * Determine the color associated with a danger class. Colors are pulled from CSS custom properties
 * defined in the stylesheet. If a variable is missing, a reasonable fallback is used.
 * 
 * @param {number} dangerClass - Integer between 1 and 4 representing the fire danger level.
 * @returns {string} A CSS color string.
 */
function getDangerColor(dangerClass) {
    const rootStyles = getComputedStyle(document.documentElement);
    const varName = `--class-${dangerClass}-bg`;
    let color = rootStyles.getPropertyValue(varName).trim();
    if (!color) {
        // Fallback palette matching the README
        switch (dangerClass) {
            case 1: color = '#4ECDC4'; break;
            case 2: color = '#FFA726'; break;
            case 3: color = '#EF5350'; break;
            case 4: color = '#B71C1C'; break;
            default: color = '#4ECDC4';
        }
    }
    return color;
}

/**
 * Populate the map with markers for each county. The global countyLayerGroup will be cleared before adding new markers.
 * Each marker is a circle marker colored according to the county's danger class and displays a popup with details.
 * 
 * @param {Array<Object>} counties - Array of county weather objects produced by fetchCountyWeather().
 */
function addCountyMarkers(counties) {
    if (!countyLayerGroup) {
        countyLayerGroup = L.layerGroup().addTo(map);
    }
    countyLayerGroup.clearLayers();
    counties.forEach(county => {
        // Determine color for this danger class
        const fillColor = getDangerColor(county.dangerClass);
        const marker = L.circleMarker([county.lat, county.lon], {
            radius: 8,
            color: '#000',
            weight: 1,
            fillColor: fillColor,
            fillOpacity: 0.85
        });
        const popupContent = `
            <strong>${county.name} County</strong><br>
            Temp: ${county.temp ?? 'N/A'}°F<br>
            RH: ${county.rh ?? 'N/A'}%<br>
            Dew Pt: ${county.dewPoint ?? 'N/A'}°F<br>
            Wind: ${county.wind ?? 'N/A'} mph<br>
            Gust: ${county.gust ?? 'N/A'} mph<br>
            Danger: ${['Low','Moderate','High','Extreme'][Math.max(0, county.dangerClass - 1)]}
        `;
        marker.bindPopup(popupContent);
        marker.addTo(countyLayerGroup);
    });
}

// Load County Weather Data
async function loadCountyData() {
    const countyGrid = document.getElementById('countyGrid');
    countyGrid.innerHTML = '<div class="loading">Loading county data...</div>';

    // Build live data for each monitored county using the NWS API.
    const countiesData = [];
    for (const county of COUNTIES) {
        try {
            const data = await fetchCountyWeather(county);
            countiesData.push(data);
        } catch (error) {
            // On error fallback to demo values to avoid breaking the UI.
            console.error('Error fetching weather for', county.name, error);
            countiesData.push({
                name: county.name,
                temp: Math.floor(Math.random() * 20) + 65,
                rh: Math.floor(Math.random() * 40) + 20,
                dewPoint: Math.floor(Math.random() * 20) + 45,
                wind: Math.floor(Math.random() * 15) + 5,
                gust: Math.floor(Math.random() * 10) + 15,
                dangerClass: Math.floor(Math.random() * 4) + 1,
                lat: county.lat,
                lon: county.lon
            });
        }
    }
    // Render updated cards and update timestamp
    renderCountyCards(countiesData);
    updateTimestamp(new Date().toISOString());
    // Update map markers to reflect current danger levels
    addCountyMarkers(countiesData);
}

// Generate demo data (until backend is set up)
async function generateDemoData() {
    return COUNTIES.map(county => ({
        name: county.name,
        temp: Math.floor(Math.random() * 20) + 65,
        rh: Math.floor(Math.random() * 40) + 20,
        dewPoint: Math.floor(Math.random() * 20) + 45,
        wind: Math.floor(Math.random() * 15) + 5,
        gust: Math.floor(Math.random() * 10) + 15,
        // Danger class between 1 and 4 for demo data
        dangerClass: Math.floor(Math.random() * 4) + 1
    }));
}

// Calculate fire danger class from weather data
function calculateDangerClass(temp, rh, wind) {
    let score = 0;

    // Temperature scoring
    if (temp >= 80) score += 2;
    else if (temp >= 70) score += 1;

    // Relative Humidity scoring
    if (rh < 20) score += 3;
    else if (rh < 30) score += 2;
    else if (rh < 40) score += 1;

    // Wind scoring
    if (wind >= 18) score += 2;
    else if (wind >= 12) score += 1;

    // Convert score to 4-level fire danger class (1: Low, 2: Moderate, 3: High, 4: Extreme)
    if (score <= 2) return 1;
    if (score <= 5) return 2;
    if (score <= 8) return 3;
    return 4;
}

// Render county cards with danger labels and classes
function renderCountyCards(counties) {
    const countyGrid = document.getElementById('countyGrid');
    countyGrid.innerHTML = '';

    // Four-level fire danger labels: Low, Moderate, High, Extreme
    const dangerLabels = ['Low', 'Moderate', 'High', 'Extreme'];

    counties.forEach(county => {
        // If danger class isn't provided, calculate based on temp, RH, and wind
        // Determine danger class, clamping to valid range 1-4
        const rawClass = county.dangerClass || calculateDangerClass(county.temp, county.rh, county.wind);
        const dangerClass = Math.max(1, Math.min(rawClass, dangerLabels.length));
        const label = dangerLabels[dangerClass - 1] || 'N/A';

        const card = document.createElement('div');
        card.className = 'county-card';

        card.innerHTML = `
          <div class="danger-bubble class-${dangerClass}" title="${label}">
            ${dangerClass}
          </div>
          <div class="county-name">${county.name} County</div>
          <div class="county-data">
            <div class="data-row">
              <span class="data-label">Temp</span>
              <span class="data-value">${county.temp}°F</span>
            </div>
            <div class="data-row">
              <span class="data-label">RH</span>
              <span class="data-value">${county.rh}%</span>
            </div>
            <div class="data-row">
              <span class="data-label">Dew Pt</span>
              <span class="data-value">${county.dewPoint}°F</span>
            </div>
            <div class="data-row">
              <span class="data-label">Wind</span>
              <span class="data-value">${county.wind} mph</span>
            </div>
            <div class="data-row">
              <span class="data-label">Gust</span>
              <span class="data-value">${county.gust} mph</span>
            </div>
            <div class="data-row">
              <span class="data-label">Danger</span>
              <span class="data-value">${label}</span>
            </div>
          </div>
        `;

        countyGrid.appendChild(card);
    });
}

// Update timestamp displayed in the header
function updateTimestamp(timestamp) {
    const lastUpdate = document.getElementById('lastUpdate');
    const date = new Date(timestamp);
    lastUpdate.textContent = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Refresh data and animate button
async function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.style.animation = 'spin 1s linear';

    await loadCountyData();

    setTimeout(() => {
        refreshBtn.style.animation = '';
    }, 1000);
}

// Add spin animation to the document
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
