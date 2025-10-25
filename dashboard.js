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
    dangerLevel: 'MODERATE DANGER'
  },
  {
    name: 'Nottoway County',
    lat: 37.1299,
    lon: -78.0747,
    temp: 71,
    humidity: 50,
    wind: '6 mph S',
    dangerLevel: 'LOW DANGER'
  },
  {
    name: 'Prince George County',
    lat: 37.2199,
    lon: -77.2886,
    temp: 74,
    humidity: 43,
    wind: '9 mph SW',
    dangerLevel: 'MODERATE DANGER'
  }
];

// Fire danger color mapping
function getDangerColor(level) {
  const colors = {
    'LOW DANGER': '#4CAF50',
    'MODERATE DANGER': '#FF9800',
    'HIGH DANGER': '#F44336',
    'VERY HIGH DANGER': '#B71C1C',
    'EXTREME DANGER': '#4A148C'
  };
  return colors[level] || '#9E9E9E';
}

// Generate county cards
function generateCards() {
  const cardsContainer = document.getElementById('cards');
  cardsContainer.innerHTML = '';
  
  COUNTIES_DATA.forEach(county => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.borderLeft = `5px solid ${getDangerColor(county.dangerLevel)}`;
    card.innerHTML = `
      <h3>${county.name}</h3>
      <div class="danger-badge" style="background: ${getDangerColor(county.dangerLevel)}">
        ${county.dangerLevel}
      </div>
      <div class="weather-info">
        <p>Temperature: ${county.temp}°F</p>
        <p>Humidity: ${county.humidity}%</p>
        <p>Wind: ${county.wind}</p>
      </div>
    `;
    cardsContainer.appendChild(card);
  });
}

// Initialize Leaflet map
function initMap() {
  const map = L.map('map').setView([37.2, -77.9], 9);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
  
  // Add county markers
  COUNTIES_DATA.forEach(county => {
    const color = getDangerColor(county.dangerLevel);
    const marker = L.circleMarker([county.lat, county.lon], {
      radius: 8,
      fillColor: color,
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);
    
    marker.bindPopup(`
      <b>${county.name}</b><br>
      Danger: ${county.dangerLevel}<br>
      Temp: ${county.temp}°F<br>
      Humidity: ${county.humidity}%<br>
      Wind: ${county.wind}
    `);
  });
}

// Update timestamp
function updateTimestamp() {
  const now = new Date();
  document.getElementById('lastUpdate').textContent = now.toLocaleString();
}

// Forecast Modal Functionality
function initForecastModal() {
  const modal = document.getElementById('forecastModal');
  const updateBtn = document.getElementById('updateForecastBtn');
  const closeBtn = document.querySelector('.close-btn');
  const modalContent = document.getElementById('forecastContent');
  
  // Open modal and fetch forecast data
  updateBtn.addEventListener('click', async () => {
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    try {
      modalContent.innerHTML = 'Loading forecast data...';
      
      // Fetch the forecast HTML file
      const response = await fetch('forecasts/current-forecast.html');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const htmlText = await response.text();
      
      // Parse the HTML to extract the forecast content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      // Extract the main content (skip header/footer if any)
      const forecastBody = doc.querySelector('body') || doc.documentElement;
      
      // Display the forecast content
      modalContent.innerHTML = forecastBody.innerHTML;
      
      // Apply styling to tables if present
      const tables = modalContent.querySelectorAll('table');
      tables.forEach(table => {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '20px';
        
        const cells = table.querySelectorAll('td, th');
        cells.forEach(cell => {
          cell.style.border = '1px solid #ddd';
          cell.style.padding = '8px';
          cell.style.textAlign = 'left';
        });
        
        const headers = table.querySelectorAll('th');
        headers.forEach(header => {
          header.style.backgroundColor = '#f2f2f2';
          header.style.fontWeight = 'bold';
        });
      });
      
    } catch (error) {
      console.error('Error fetching forecast:', error);
      modalContent.innerHTML = `
        <div style="color: #f44336; padding: 20px; text-align: center;">
          <h3>Error Loading Forecast</h3>
          <p>Unable to load the forecast data. Please try again later.</p>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  });
  
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
