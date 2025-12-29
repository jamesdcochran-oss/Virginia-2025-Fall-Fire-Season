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
  document.getElementById('fuelCalcBtn').addEventListener('click', openFuelCalcModal);
  document.getElementById('modalCloseBtn').addEventListener('click', closeFuelCalcModal);
  
  // Close modal when clicking backdrop
  document.getElementById('fuelCalcModal').addEventListener('click', function(e) {
    if (e.target === this) closeFuelCalcModal();
  });
  
  // Run Model button
  document.getElementById('runModelBtn').addEventListener('click', runModelFromUI);
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-color-scheme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-color-scheme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-color-scheme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Map Initialization
let map;
let countyLayerGroup;

function initMap() {
  map = L.map('map').setView([37.2, -77.7], 8);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© CartoDB',
    maxZoom: 19
  }).addTo(map);

  countyLayerGroup = L.layerGroup().addTo(map);
}

function getDangerColor(dangerClass) {
  const rootStyles = getComputedStyle(document.documentElement);
  const varName = `--class-${dangerClass}-bg`;
  let color = rootStyles.getPropertyValue(varName).trim();

  if (!color) {
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

function addCountyMarkers(counties) {
  if (!countyLayerGroup) {
    countyLayerGroup = L.layerGroup().addTo(map);
  }
  countyLayerGroup.clearLayers();

  counties.forEach(county => {
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

// Load County Weather Data from pre-generated JSON
async function loadCountyData() {
  const countyGrid = document.getElementById('countyGrid');
  countyGrid.innerHTML = '<div class="loading">Loading county data...</div>';
  
  try {
    const response = await fetch('county_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    renderCountyCards(data.counties);
    updateTimestamp(data.lastUpdated);
    
    const countiesWithCoords = data.counties.map(county => ({
      ...county,
      lat: COUNTIES.find(c => c.name === county.name).lat,
      lon: COUNTIES.find(c => c.name === county.name).lon
    }));
    addCountyMarkers(countiesWithCoords);
    
    loadFIRMSData();
    
  } catch (error) {
    console.error('Error loading county data:', error);
    countyGrid.inner
          loadForecastData();HTML = '<div class="error">⚠️ Unable to load county data. Please refresh.</div>';
  }
}

// Load FIRMS fire hotspot data from pre-generated JSON
// Load FIRMS fire hotspot data with enhanced satellite info and color coding
async function loadFIRMSData() {
    try {
        const response = await fetch('firms_data.json');
        if (!response.ok) {
            console.warn('FIRMS data unavailable');
            return;
        }
        const data = await response.json();
        
        // Display statistics if available
        if (data.statistics) {
            console.log('🔥 FIRMS Data Statistics:', data.statistics);
            const totalDetections = Object.values(data.statistics).reduce((a, b) => a + b, 0);
            console.log(`📊 Total detections: ${totalDetections} (${data.count} unique after deduplication)`);
        }
        
        if (data.hotspots && data.hotspots.length > 0) {
            data.hotspots.forEach(hotspot => {
                // Color code by satellite source
                let color = '#ff4444';
                let satelliteName = 'Unknown';
                
                if (hotspot.satellite) {
                    if (hotspot.satellite.includes('MODIS')) {
                        color = '#ff6600'; // Orange for MODIS
                        satelliteName = 'MODIS (Terra/Aqua)';
                    } else if (hotspot.satellite.includes('SNPP')) {
                        color = '#ff0000'; // Bright red for VIIRS SNPP
                        satelliteName = 'VIIRS S-NPP';
                    } else if (hotspot.satellite.includes('NOAA20')) {
                        color = '#cc0000'; // Dark red for VIIRS NOAA-20
                        satelliteName = 'VIIRS NOAA-20';
                    }
                }
                
                // Create fire marker with enhanced popup
                L.circleMarker([hotspot.latitude, hotspot.longitude], {
                    radius: 6,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7,
                    weight: 2
                }).bindPopup(`
                    <div style="min-width: 200px;">
                        <strong style="font-size: 14px;">🔥 Fire Detection</strong><br><br>
                        <b>Satellite:</b> ${satelliteName}<br>
                        <b>Confidence:</b> <span style="color: ${hotspot.confidence === 'high' ? '#00aa00' : hotspot.confidence === 'nominal' ? '#ffaa00' : '#ff6600'}">${hotspot.confidence || 'Unknown'}</span><br>
                        <b>Brightness:</b> ${hotspot.brightness}K<br>
                        <b>FRP:</b> ${hotspot.frp || 'N/A'} MW<br>
                        <b>Location:</b> ${hotspot.latitude.toFixed(4)}°N, ${Math.abs(hotspot.longitude).toFixed(4)}°W<br>
                        <b>Detected:</b> ${hotspot.acq_date} ${hotspot.acq_time} UTC
                    </div>
                `).addTo(map);
            });
            
            console.log(`✅ Loaded ${data.hotspots.length} fire hotspots on map`);
        } else {
            console.log('✓ No active fire hotspots detected in Virginia');
        }
    } catch (error) {
        console.warn('Could not load FIRMS data:', error);
    }
}


function calculateDangerClass(temp, rh, wind) {
  let score = 0;

  // Load and display forecast data from JSON
async function loadForecastData() {
  try {
    const response = await fetch('forecasts/forecast_data.json');
    if (!response.ok) {
      console.warn('Forecast data not available');
      return;
    }
    const data = await response.json();
    
    // Display dates
    const datesEl = document.getElementById('forecastDates');
    if (datesEl && data.dates) {
      datesEl.textContent = `Forecast Period: ${data.dates}`;
    }
    
    // Display overview
    const overviewEl = document.getElementById('forecastOverview');
    if (overviewEl && data.overview) {
      overviewEl.innerHTML = `<p>${data.overview}</p>`;
    }
    
    // Build forecast table
    const tableEl = document.getElementById('forecastTable');
    if (tableEl && data.classes && data.classes.length > 0) {
      const headers = ['County', 'Day 1 Local', 'Day 1 DOF', 'Day 2 Local', 'Day 2 DOF', 'Day 3 Local', 'Day 3 DOF'];
      const rows = data.classes.map(c => [
        c.county,
        c.day1Local,
        c.day1DOF,
        c.day2Local,
        c.day2DOF,
        c.day3Local,
        c.day3DOF
      ]);
      buildForecastTable('forecastTable', headers, rows);
    }
    
    console.log('✅ Forecast data loaded successfully');
  } catch (error) {
    console.warn('Could not load forecast data:', error);
  }
}


  if (temp >= 80) score += 2;
  else if (temp >= 70) score += 1;

  if (rh < 20) score += 3;
  else if (rh < 30) score += 2;
  else if (rh < 40) score += 1;

  if (wind >= 18) score += 2;
  else if (wind >= 12) score += 1;

  if (score <= 2) return 1;
  if (score <= 5) return 2;
  if (score <= 8) return 3;
  return 4;
}

function renderCountyCards(counties) {
  const countyGrid = document.getElementById('countyGrid');
  countyGrid.innerHTML = '';

  const dangerLabels = ['Low', 'Moderate', 'High', 'Extreme'];

  counties.forEach(county => {
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
          <span class="data-value">${county.temp ?? 'N/A'}°F</span>
        </div>
        <div class="data-row">
          <span class="data-label">RH</span>
          <span class="data-value">${county.rh ?? 'N/A'}%</span>
        </div>
        <div class="data-row">
          <span class="data-label">Dew Pt</span>
          <span class="data-value">${county.dewPoint ?? 'N/A'}°F</span>
        </div>
        <div class="data-row">
          <span class="data-label">Wind</span>
          <span class="data-value">${county.wind ?? 'N/A'} mph</span>
        </div>
        <div class="data-row">
          <span class="data-label">Gust</span>
          <span class="data-value">${county.gust ?? 'N/A'} mph</span>
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

async function refreshData() {
  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn.style.animation = 'spin 1s linear';
  await loadCountyData();
  setTimeout(() => {
    refreshBtn.style.animation = '';
  }, 1000);
}

// Fuel Calculator Modal Controls
function openFuelCalcModal() {
  const modal = document.getElementById('fuelCalcModal');
  modal.style.display = 'flex';
  buildFuelCalcForecastTable();
}

function closeFuelCalcModal() {
  const modal = document.getElementById('fuelCalcModal');
  modal.style.display = 'none';
}

// Build forecast table rows (5 days)
function buildFuelCalcForecastTable() {
  const tbody = document.getElementById('forecastDays');
  tbody.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>Day ${i}</td>
      <td><input type="number" id="temp_${i}" value="75" min="0" max="120"></td>
      <td><input type="number" id="rh_${i}" value="30" min="0" max="100"></td>
      <td><input type="number" id="wind_${i}" value="5" min="0" max="50"></td>
      <td><input type="number" id="hours_${i}" value="10" min="0" max="24" step="0.5"></td>
    `;
    tbody.appendChild(row);
  }
}

// Run Model from UI
function runModelFromUI() {
  // Get initial conditions
  const initial1Hr = parseFloat(document.getElementById('initial1hr').value);
  const initial10Hr = parseFloat(document.getElementById('initial10hr').value);

  // Collect forecast data
  const forecast = [];
  for (let i = 1; i <= 5; i++) {
    forecast.push({
      label: `Day ${i}`,
      temp: parseFloat(document.getElementById(`temp_${i}`).value),
      rh: parseFloat(document.getElementById(`rh_${i}`).value),
      wind: parseFloat(document.getElementById(`wind_${i}`).value),
      dryingHours: parseFloat(document.getElementById(`hours_${i}`).value)
    });
  }

  // Run the fuel moisture model
  const results = runFuelMoistureModel({ initial1Hr, initial10Hr, forecast });

  // Display results
  displayResults(results);
}

// Display calculation results
function displayResults(results) {
  const resultsSection = document.getElementById('resultsSection');
  const resultsTable = document.getElementById('resultsTable');
  const warningBox = document.getElementById('warningMessage');

  // Build results table
  let html = '<table style="width:100%; border-collapse: collapse;">';
  html += '<tr><th>Day</th><th>1-hr FM (%)</th><th>10-hr FM (%)</th><th>Status</th></tr>';

  let criticalDays = [];
  results.dailyResults.forEach((day, i) => {
    const status1hr = day.moisture1Hr <= 6 ? '⚠️ Critical' : day.moisture1Hr <= 8 ? '⚡ Elevated' : '✓ Normal';
    const status10hr = day.moisture10Hr <= 8 ? '⚠️ Critical' : day.moisture10Hr <= 10 ? '⚡ Elevated' : '✓ Normal';
    const worstStatus = (day.moisture1Hr <= 6 || day.moisture10Hr <= 8) ? 'Critical' : 'Normal';
    if (worstStatus === 'Critical') criticalDays.push(i + 1);

    html += `<tr>`;
    html += `<td>${day.label}</td>`;
    html += `<td>${day.moisture1Hr}% ${status1hr}</td>`;
    html += `<td>${day.moisture10Hr}% ${status10hr}</td>`;
    html += `<td>${worstStatus}</td>`;
    html += `</tr>`;
  });
  html += '</table>';
  resultsTable.innerHTML = html;

  // Show warning if critical
  if (criticalDays.length > 0) {
    warningBox.innerHTML = `⚠️ CRITICAL FIRE WEATHER: Extremely low fuel moisture on Day${criticalDays.length > 1 ? 's' : ''} ${criticalDays.join(', ')}. Increased fire danger expected.`;
    warningBox.style.display = 'block';
  } else {
    warningBox.style.display = 'none';
  }

  // Show results section
  resultsSection.style.display = 'block';
}

// Add spin animation for refresh button
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);


// Five Forks Fire Weather Forecast Data
const fiveForksForecast = {
  dates: "December 18–20, 2025",
  counties: ["Amelia","Brunswick","Dinwiddie","Greensville","Nottoway","Prince George"],
  overview: "A strong cold front brings rain and gusty winds tonight into Friday, followed by drier, seasonable high pressure through the weekend. Fire danger remains low to moderate with some short-term wind concerns as fuels dry after frontal passage.",
  csiNote: "CSI coverage note: The Farmville (Central Region) CSI 231–235 (Class 2) applies to areas including Nottoway and Amelia Counties, while the Petersburg (Five Forks District) CSI 352 (Class 2) applies to the remainder of the Five Forks service area (Brunswick, Dinwiddie, Greensville, Prince George).",
  classes: [
    { county: "Amelia",       thuLocal: 2, thuDOF: "2 (Farmville)",   friLocal: 2, friDOF: "2 (Farmville)",   satLocal: "1–2", satDOF: "2 (Farmville)" },
    { county: "Brunswick",    thuLocal: 2, thuDOF: "2 (Petersburg)", friLocal: 2, friDOF: "2 (Petersburg)", satLocal: "1–2", satDOF: "2 (Petersburg)" },
    { county: "Dinwiddie",    thuLocal: 2, thuDOF: "2 (Petersburg)", friLocal: 2, friDOF: "2 (Petersburg)", satLocal: "1–2", satDOF: "2 (Petersburg)" },
    { county: "Greensville",  thuLocal: 2, thuDOF: "2 (Petersburg)", friLocal: 2, friDOF: "2 (Petersburg)", satLocal: "1–2", satDOF: "2 (Petersburg)" },
    { county: "Nottoway",     thuLocal: 2, thuDOF: "2 (Farmville)",  friLocal: 2, friDOF: "2 (Farmville)",  satLocal: "1–2", satDOF: "2 (Farmville)" },
    { county: "Prince George",thuLocal: 2, thuDOF: "2 (Petersburg)", friLocal: 2, friDOF: "2 (Petersburg)", satLocal: "1–2", satDOF: "2 (Petersburg)" }
  ],
  ros: [
    { county: "Amelia",        thu: "300–720", fri: "600–1200", sat: "240–600", peakThu: "1300–1600", peakFri: "1200–1700", peakSat: "1300–1600" },
    { county: "Brunswick",     thu: "300–720", fri: "600–1200", sat: "240–600", peakThu: "1300–1600", peakFri: "1200–1700", peakSat: "1300–1600" },
    { county: "Dinwiddie",     thu: "300–720", fri: "600–1200", sat: "240–600", peakThu: "1300–1600", peakFri: "1200–1700", peakSat: "1300–1600" },
    { county: "Greensville",   thu: "300–720", fri: "600–1200", sat: "240–600", peakThu: "1300–1600", peakFri: "1200–1700", peakSat: "1300–1600" },
    { county: "Nottoway",      thu: "300–720", fri: "600–1200", sat: "240–600", peakThu: "1300–1600", peakFri: "1200–1700", peakSat: "1300–1600" },
    { county: "Prince George", thu: "300–720", fri: "600–1200", sat: "240–600", peakThu: "1300–1600", peakFri: "1200–1700", peakSat: "1300–1600" }
  ]
};

// Function to build HTML tables
function buildFiveForksForecastTable(tableId, headers, rows) {
  const table = document.getElementById(tableId);
  if (!table) return;
    table.innerHTML = ''; // Clear existing content

  
  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create body
  const tbody = document.createElement('tbody');
  rows.forEach(rowData => {
    const tr = document.createElement('tr');
    rowData.forEach(cellData => {
      const td = document.createElement('td');
      td.textContent = cellData;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

// Render Five Forks Forecast
function renderFiveForksForecast() {
 
  
  function buildForecastTable(tableId, headers, rows) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.innerHTML = ''; // Clear existing content
  
  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create body
  const tbody = document.createElement('tbody');
  rows.forEach(rowData => {
    const tr = document.createElement('tr');
    rowData.forEach(cellData => {
      const td = document.createElement('td');
      td.textContent = cellData;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}// Set text content
  const datesEl = document.getElementById('ff-dates');
  const overviewEl = document.getElementById('ff-overview');
  const csiNoteEl = document.getElementById('ff-csi-note');
  
  if (datesEl) datesEl.textContent = `Dates: ${fiveForksForecast.dates}`;
  if (overviewEl) overviewEl.textContent = fiveForksForecast.overview;
  if (csiNoteEl) csiNoteEl.textContent = fiveForksForecast.csiNote;

  // Build class table
  buildForecastTable(
    'ff-class-table',
    ['County','Thu 18 Local','Thu 18 DOF','Fri 19 Local','Fri 19 DOF','Sat 20 Local','Sat 20 DOF'],
    fiveForksForecast.classes.map(c => [
      c.county, c.thuLocal, c.thuDOF, c.friLocal, c.friDOF, c.satLocal, c.satDOF
    ])
  );

  // Build ROS table
  buildForecastTable(
    'ff-ros-table',
    ['County','Thu ROS (ft/hr)','Thu Peak','Fri ROS (ft/hr)','Fri Peak','Sat ROS (ft/hr)','Sat Peak'],
    fiveForksForecast.ros.map(c => [
      c.county, c.thu, c.peakThu, c.fri, c.peakFri, c.sat, c.peakSat
    ])
  );
}

// Call render function when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderFiveForksForecast);
} else {
  renderFiveForksForecast();
}
