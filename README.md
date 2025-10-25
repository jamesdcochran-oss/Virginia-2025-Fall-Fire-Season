# 🔥 Five Forks Fire Weather Dashboard

A mobile-optimized, real-time fire weather monitoring dashboard for Central Virginia counties served by the Five Forks Volunteer Fire Department.

## 🌐 Live Dashboard

Access the dashboard at: **[https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season](https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season)**

## 📱 Features

- **Mobile-First Design**: Fully responsive layout optimized for smartphones, tablets, and desktop
- **Real-Time County Data**: Monitor fire danger levels for 6 Central VA counties
- **Interactive Map**: Visual representation of fire danger zones with color-coded markers
- **Key Weather Metrics**: Temperature, humidity, and wind conditions for each county
- **Auto-Updating**: Dashboard refreshes every 6 hours with latest conditions

## 🗺️ Monitored Counties

1. **Amelia County**
2. **Brunswick County**
3. **Dinwiddie County**
4. **Nottoway County**
5. **Prince George County**
6. **Sussex County**

## 🎨 Fire Danger Levels

The dashboard displays four color-coded danger levels:

- 🟢 **LOW** - Green: Minimal fire risk
- 🟠 **MODERATE** - Orange: Increased caution advised
- 🔴 **HIGH** - Red: High fire risk, extreme caution
- ⚫ **EXTREME** - Dark Red: Critical fire conditions

## 📊 Data Sources

The dashboard integrates weather data from:
- National Weather Service API
- NOAA Weather Forecasts
- Local weather station feeds

## 🛠️ Technical Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Mobile-first responsive design with flexbox/grid
- **JavaScript**: Vanilla JS for dynamic content rendering
- **Leaflet.js**: Interactive mapping library
- **OpenStreetMap**: Map tile provider

## 📂 Repository Structure

```
Virginia-2025-Fall-Fire-Season/
├── index.html          # Main dashboard page (mobile-optimized)
├── style.css           # Legacy styles (not used in current version)
├── dashboard.js        # Additional dashboard scripts
├── .github/workflows/  # GitHub Actions automation
├── forecasts/          # Weather forecast data
└── scripts/            # Data processing scripts
```

## 🚀 Setup & Deployment

### GitHub Pages Setup

1. Navigate to **Settings** > **Pages**
2. Under "Source", select **Deploy from a branch**
3. Choose branch: **main** and folder: **/ (root)**
4. Click **Save**
5. Your dashboard will be live at: `https://[username].github.io/Virginia-2025-Fall-Fire-Season`

### Local Development

```bash
# Clone the repository
git clone https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season.git

# Navigate to directory
cd Virginia-2025-Fall-Fire-Season

# Open in browser
# Simply open index.html in your web browser
# Or use a local server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

## 🔄 Updating Data

The dashboard currently uses demo data. To integrate live weather data:

1. Edit the `countyData` array in `index.html`
2. Connect to a weather API (e.g., NWS API, OpenWeatherMap)
3. Update the data refresh interval in the JavaScript section

### Example API Integration

```javascript
// Fetch live weather data
async function fetchWeatherData(lat, lon) {
  const response = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
  const data = await response.json();
  return data;
}
```

## 📱 Mobile Optimization Features

- **Responsive Grid**: Auto-adjusts from 3 columns (desktop) to 1 column (mobile)
- **Touch-Friendly**: Large tap targets and swipe-friendly map
- **Reduced Data**: Optimized for slower mobile connections
- **Readable Typography**: Clamps font sizes for all screen sizes
- **Fast Loading**: Inline CSS for instant rendering

## 🧪 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android 8+)

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available for use by fire departments and emergency services.

## 📞 Contact

**Five Forks Volunteer Fire Department**  
For questions or support, please open an issue in this repository.

## 🔐 Security

If you discover a security vulnerability, please email the repository owner directly rather than opening a public issue.

## 📅 Updates

- **October 2025**: Initial mobile-optimized dashboard deployment
- Dashboard auto-updates every 6 hours
- Weather data sourced from NOAA/NWS

---

**Built with ❤️ for the Five Forks Volunteer Fire Department and Central Virginia communities**
