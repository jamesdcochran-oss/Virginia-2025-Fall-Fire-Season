# 🔥 Five Forks Fire Weather Dashboard

A mobile-optimized, real-time fire weather monitoring dashboard for Central Virginia counties served by the Five Forks Volunteer Fire Department.

## 🌐 Live Dashboard

Access the dashboard at: **[https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season](https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season)**

## 📋 Daily Fire Weather Brief

Automated daily fire weather briefings are generated and available in the [briefs folder](https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season/tree/main/briefs).

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

## 🗺️ Monitored Counties

1. **Amelia County**
2. **Brunswick County**
3. **Dinwiddie County**
4. **Greensville County**
5. **Nottoway County**
6. **Prince George County**

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
- **JavaScript**: Dynamic data rendering
- **Leaflet.js**: Interactive mapping
- **Python**: Automated data fetching and brief generation
- **GitHub Actions**: Scheduled workflows
- **GitHub Pages**: Automated deployment

## 🚀 Automated Updates

The system features GitHub Actions workflows:

- **Weather Data**: Fetches NWS observations every 6 hours
- **Daily Briefs**: Generates DOCX fire weather briefs once per day
- **CI/Smoke Tests**: Validates code and data integrity on every push
- **Auto-Deploy**: Updates publish automatically to GitHub Pages

## 🔧 Local Development

### Prerequisites

- Python 3.x
- Node.js (optional, for syntax checking)
- Web browser with modern JavaScript support

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season.git
   cd Virginia-2025-Fall-Fire-Season
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run local server**
   ```bash
   python -m http.server 8000
   ```

4. **Open in browser**
   - Dashboard: http://localhost:8000/
   - Diagnostics: http://localhost:8000/diagnostics.html
   - Briefs Index: http://localhost:8000/briefs/

### Running Diagnostics

The dashboard includes a comprehensive diagnostics page to verify system health:

```bash
# Python diagnostics
python diagnostic_check.py

# Browser diagnostics (after starting local server)
# Navigate to http://localhost:8000/diagnostics.html
```

The diagnostics page tests:
- ✅ Fuel calculator functions (computeEMC, stepMoisture, runModel)
- ✅ Counties data loading and structure
- ✅ Map dependencies (Leaflet.js)
- ✅ Fetch API availability

### Project Structure

```
Virginia-2025-Fall-Fire-Season/
├── index.html              # Main dashboard
├── diagnostics.html        # Diagnostic testing page
├── fuel-calculator.js      # Fuel moisture calculator
├── scripts/
│   └── dashboard.js        # Dashboard logic with county loading
├── data/
│   └── counties.json       # County coordinates (6 counties)
├── briefs/
│   ├── index.html          # Briefs index page
│   └── *.docx              # Generated daily briefs
├── .github/workflows/
│   ├── ci.yml              # CI smoke tests
│   ├── update-data.yml     # Weather updates
│   └── daily-brief.yml     # Brief generation
├── CONTRIBUTING.md         # Contribution guidelines
└── README.md               # This file
```

## 🧪 Testing & CI

### Continuous Integration

The CI workflow runs automatically on push and pull requests:

- File existence checks
- JSON validation (counties.json, county_data.json, firms_data.json)
- JavaScript syntax validation
- County data structure validation
- Diagnostic script execution

### Manual Testing

```bash
# Validate JSON files
python -m json.tool data/counties.json

# Check JavaScript syntax
node -c fuel-calculator.js
node -c scripts/dashboard.js

# Run diagnostic checks
python diagnostic_check.py
```

## 💧 Fuel Moisture Calculator

The dashboard includes a minimal, robust fuel moisture calculator:

- **computeEMC(tempF, rh)**: Empirical equilibrium moisture content
- **stepMoisture(initial, emc, hours, timeLag)**: Exponential time-lag model
- **runModel(initial1hr, initial10hr, forecast)**: Multi-day forecast model

Access via the 💧 **Fuel Calc** button in the dashboard utility bar.

## 🗺️ Map Features

- Interactive county visualization with Leaflet.js
- Tile provider with automatic fallback (CartoDB → OpenStreetMap)
- Color-coded fire danger markers
- NASA FIRMS fire hotspot integration

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup instructions
- Code style guidelines
- Testing procedures
- Pull request process

## 👨‍🚒 Five Forks VFD



## 📝 License

MIT License - feel free to adapt for your local fire department or emergency response team.

**Last Updated**: January 2026  
**Maintained by**: Five Forks Fire Weather Team
