# 🔥 Five Forks Fire Weather Dashboard

A mobile-optimized, real-time fire weather monitoring dashboard for Central Virginia counties served by the Five Forks Volunteer Fire Department.

## 🌐 Live Dashboard

Access the dashboard at: **[https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season](https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season)**

**Diagnostics Page**: [https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season/diagnostics.html](https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season/diagnostics.html)

## 📋 Daily Fire Weather Brief

Automated daily fire weather briefings are generated and available in the [briefs folder](https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season/tree/main/briefs).

**Browse Briefs**: [https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season/briefs/](https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season/briefs/)

**Latest Brief:** [Download Current Brief](https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season/blob/main/briefs/)

Briefings are automatically generated daily and include:
- Current fire weather conditions for all monitored counties
- County-level temperature, humidity, wind, and fire danger data
- Timestamp of data collection

## 📱 Features

- **Mobile-First Design**: Fully responsive layout optimized for smartphones, tablets, and desktop
- **Real-Time County Data**: Monitor current conditions for 6 Central VA counties
- **Interactive Map**: Visual representation of county locations with Leaflet.js
- **Key Weather Metrics**: Temperature, relative humidity, dew point, wind speed, and gust data
- **Fire Danger Classifications**: Color-coded danger levels for each county
- **Auto-Updating**: Dashboard refreshes every 6 hours with latest NWS observations
- **Quick-Access Utility Bar**: Direct links to NASA FIRMS, NWS Wakefield, Equipment tracking, and Windy weather
- **Fuel Moisture Calculator**: Integrated tool for forecasting fine dead fuel moisture
- **Resilient Loading**: Automatic retry logic and fallback mechanisms for data and map tiles

## 🗺️ Monitored Counties

County data is centralized in `data/counties.json` for easy maintenance:

1. **Amelia County**
2. **Brunswick County**
3. **Dinwiddie County**
4. **Greensville County**
5. **Nottoway County**
6. **Prince George County**

### Updating County List

To add or modify counties, edit `data/counties.json`:

```json
[
  { "name": "County Name", "lat": 37.1234, "lon": -77.5678 }
]
```

The dashboard automatically loads this file with fallback to embedded defaults if unavailable.

## 🎨 Fire Danger Levels

The dashboard displays color-coded danger levels:

- 🟢 **LOW** - Green: Minimal fire risk
- 🟠 **MODERATE** - Orange: Increased caution advised  
- 🔴 **HIGH** - Red: High fire risk, extreme caution
- ⚫ **EXTREME** - Dark Red: Critical fire conditions

## 📊 Data Sources

- **National Weather Service API**: Real-time observation data for each county
- **NASA FIRMS**: Fire hotspot data (linked in utility bar)

## 🛠️ Technical Stack

- **HTML5**: Semantic markup
- **CSS3**: Mobile-first responsive design
- **JavaScript**: Dynamic data rendering with resilient error handling
- **Leaflet.js**: Interactive mapping with tile fallback support
- **Python**: Automated data fetching and brief generation
- **GitHub Actions**: Scheduled workflows and CI/CD
- **GitHub Pages**: Automated deployment

## 🚀 Automated Updates & Deployment

### GitHub Actions Workflows

The system features several automated workflows:

- **Weather Data**: Fetches NWS observations every 6 hours (`update-weather.yml`)
- **Daily Briefs**: Generates DOCX fire weather briefs once per day (`daily-brief.yml`)
- **FIRMS Sync**: Updates fire hotspot data (`firms-sync.yml`)
- **CI Smoke Tests**: Validates dashboard integrity on every push (`ci.yml`)
- **Auto-Deploy**: Updates publish automatically to GitHub Pages

### Deployment Notes

The dashboard is automatically deployed via GitHub Pages:

1. **Main Branch**: Production deployment at the live URL
2. **Feature Branches**: Can be tested locally or via fork deployments
3. **Pull Requests**: CI runs automatically to validate changes

**Manual Deployment**: Not required - all changes merged to `main` are auto-deployed within minutes.

## 🧪 Running Diagnostics & CI Locally

### Browser-Based Diagnostics

Open `diagnostics.html` in a browser (locally or via the live URL) to check:
- Fuel calculator function availability
- Counties data loading
- County weather data structure
- Dashboard script features

### Running CI Smoke Tests Locally

```bash
# Check required files
required=(index.html dashboard.js fuel-calculator.js data/counties.json)
for f in "${required[@]}"; do
  if [ ! -f "$f" ]; then
    echo "❌ Missing: $f"
  else
    echo "✅ Found: $f"
  fi
done

# Verify fuel-calculator exports
grep -q "function computeEMC" fuel-calculator.js && echo "✅ computeEMC found"
grep -q "function stepMoisture" fuel-calculator.js && echo "✅ stepMoisture found"
grep -q "runModel" fuel-calculator.js && echo "✅ runModel found"

# Run Python diagnostic
python diagnostic_check.py
```

### Testing the Dashboard Locally

```bash
# Option 1: Python simple server
python -m http.server 8000

# Option 2: Node.js http-server (install: npm i -g http-server)
http-server -p 8000

# Then open: http://localhost:8000
```

## 👨‍🚒 Five Forks VFD



## 📝 License

MIT License - feel free to adapt for your local fire department or emergency response team.

**Last Updated**: January 2026  
**Maintained by**: Five Forks Fire Weather Team
