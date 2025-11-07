// Five Forks Fire Weather Dashboard - Main Script

// County data with centroids for NWS API
const COUNTIES = [
    { name: 'Dinwiddie', lat: 37.0751, lon: -77.5831 },
    { name: 'Brunswick', lat: 36.7168, lon: -77.8500 },
    { name: 'Greensville', lat: 36.6835, lon: -77.5664 },
    { name: 'Amelia', lat: 37.3500, lon: -77.9700 },
     { name: 'Prince George', lat: 37.1835, lon: -77.2831 },   
    { name: 'Nottoway', lat: 37.1000, lon: -78.0700 }];

// Initialize
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
function initMap() {
    map = L.map('map').setView([37.2, -77.7], 8);
    
    // Light basemap for fire visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
        maxZoom: 19
    }).addTo(map);
    
    // Load FIRMS fire data
    loadFireData();
}

// Load FIRMS CSV fire hotspot data
function loadFireData() {
  // Build FIRMS URL for VA bounding box for today's date
  const dateStr = new Date().toISOString().split('T')[0];
  const csvUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/6ec6f9501dda0774853f77ee933238ed/VIIRS_NOAA20_NRT/36.5,-79,38,-77/1/${dateStr}`;

  Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function (results) {
      results.data.forEach(function (row) {
        const lat = parseFloat(row.latitude);
        const lon = parseFloat(row.longitude);
        const brightness = parseFloat(row.brightness);

        // Keep only Virginia-area points
        if (!lat || !lon || lat < 36 || lat > 38 || lon < -79 || lon > -76) return;

        // Color by brightness
        const color =
          brightness > 350 ? '#D32F2F' :
          brightness > 320 ? '#FFA000' :
          '#FFD700';

        L.circleMarker([lat, lon], {
          radius: 6,
          color: '#000',
          fillColor: color,
          fillOpacity: 0.8,
          weight: 1
        })
          .addTo(map)
          .bindPopup(
            `<strong>Fire Detected</strong><br>
             Date: ${row.acq_date}<br>
             Time: ${row.acq_time}<br>
             Brightness: ${brightness}K<br>
             Confidence: ${row.confidence}%`
          );
      });
    },
    error: function (error) {
      console.log('FIRMS data unavailable:', error);
    }
  });
}

// Load County Weather Data
async function loadCountyData() {
    const countyGrid = document.getElementById('countyGrid');
    countyGrid.innerHTML = '<div class="loading">Loading county data...</div>';
    
    try {
        // Try to load from generated JSON first
        const response = await fetch('county_data.json');
        if (response.ok) {
            const data = await response.json();
            renderCountyCards(data.counties);
            updateTimestamp(data.timestamp);
            return;
        }
    } catch (error) {
        console.log('No pre-generated data, fetching live...');
    }
    
    // Fallback: Generate from demo data
    const countyData = await generateDemoData();
    renderCountyCards(countyData);
    updateTimestamp(new Date().toISOString());
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
        dangerClass: Math.floor(Math.random() * 3) + 2 // Classes 2-4 for demo
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
    
    // Convert score to class
    if (score <= 2) return 1;
    if (score <= 4) return 2;
    if (score <= 6) return 3;
    if (score <= 8) return 4;
    return 5;
}

// Render county cards
function renderCountyCards(counties) {
    const countyGrid = document.getElementById('countyGrid');
    countyGrid.innerHTML = '';
    
    counties.forEach(county => {
        const card = document.createElement('div');
        card.className = 'county-card';
        
        card.innerHTML = `
            <span class="danger-bubble class-${county.dangerClass}">${county.dangerClass}</span>
            <div class="county-name">${county.name}</div>
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
            </div>
        `;
        
        countyGrid.appendChild(card);
    });
}

// Update timestamp
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

// Refresh data
async function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.style.animation = 'spin 1s linear';
    
    await loadCountyData();
    
    setTimeout(() => {
        refreshBtn.style.animation = '';
    }, 1000);
}

// Add spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
