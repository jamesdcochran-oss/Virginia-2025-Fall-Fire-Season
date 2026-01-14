# 🔥 Five Forks Fire Weather Dashboard

A mobile-optimized, real-time fire weather monitoring dashboard for Central Virginia counties served by the Five Forks Volunteer Fire Department.

## 🌐 Live Dashboard

Access the dashboard at: **[https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season](https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season)**

## 📋 Daily Fire Weather Brief

Automated daily fire weather briefings are generated and available in the [briefs folder](https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season/tree/main/briefs).

**Latest Brief:** [View All Briefs](https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season/briefs/)

Briefings are automatically generated daily and include:
- Current fire weather conditions for all monitored counties
- County-level temperature, humidity, wind, and fire danger data
- Timestamp of data collection

### Regenerating Briefs

To manually regenerate a brief:

```bash
python scripts/build_five_forks_brief.py
```

Requirements:
- Python 3.7+
- `python-docx` package (`pip install python-docx`)
- County data in `county_data.json`

## 📱 Features

- **Mobile-First Design**: Fully responsive layout optimized for smartphones, tablets, and desktop
- **Real-Time County Data**: Monitor current conditions for 6 Central VA counties
- **Interactive Map**: Visual representation of county locations with Leaflet.js
- **Key Weather Metrics**: Temperature, relative humidity, dew point, wind speed, and gust data
- **Fire Danger Classifications**: Color-coded danger levels for each county
- **Auto-Updating**: Dashboard refreshes every 6 hours with latest NWS observations
- **Quick-Access Utility Bar**: Direct links to NASA FIRMS, NWS Wakefield, Equipment tracking, and Windy weather
- **Fuel Moisture Calculator**: Multi-day fuel moisture forecasting using NFDRS methodology

## 🗺️ Monitored Counties

The dashboard supports all Virginia counties and independent cities. The default Five Forks area includes:

1. **Amelia County**
2. **Brunswick County**
3. **Dinwiddie County**
4. **Greensville County**
5. **Nottoway County**
6. **Prince George County**

### Updating County List

To modify the monitored counties, edit `data/counties.json`. This file contains the complete list of Virginia counties and independent cities with centroid coordinates.

**Note:** Coordinates are approximate centroids. For precise NWS grid lookups, you may need to refine specific coordinates.

## 🎨 Fire Danger Levels

The dashboard displays color-coded danger levels:

- 🟢 **LOW** - Green: Minimal fire risk
- 🟠 **MODERATE** - Orange: Increased caution advised  
- 🔴 **HIGH** - Red: High fire risk, extreme caution
- ⚫ **EXTREME** - Dark Red: Critical fire conditions

## 📊 Data Sources

- **National Weather Service API**: Real-time observation data for each county
- **NASA FIRMS**: Fire hotspot data (linked in utility bar)
- **County List**: `data/counties.json` (centralized county data)

## 🛠️ Technical Stack

- **HTML5**: Semantic markup
- **CSS3**: Mobile-first responsive design
- **JavaScript**: Dynamic data rendering
- **Leaflet.js**: Interactive mapping with tile fallback
- **Python**: Automated data fetching and brief generation
- **GitHub Actions**: Scheduled workflows
- **GitHub Pages**: Automated deployment

## 🚀 Automated Updates

The system features GitHub Actions workflows:

- **Weather Data**: Fetches NWS observations every 6 hours
- **Daily Briefs**: Generates DOCX fire weather briefs once per day
- **Auto-Deploy**: Updates publish automatically to GitHub Pages

## 🔧 Diagnostics & Troubleshooting

### Diagnostics Page

Use the [diagnostics page](https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season/diagnostics.html) to check system health:

- Verifies all required assets are loaded
- Checks fuel calculator functions are available
- Tests data file accessibility
- Validates map tile providers
- Shows last-modified timestamps

### Running Diagnostic Check Locally

Run the Python diagnostic script to validate county data:

```bash
python diagnostic_check.py
```

This checks:
- County names match Virginia's official list
- Color logic is properly implemented
- All required counties are present

### Common Issues

**Problem: Console errors about missing functions (computeEMC, stepMoisture)**
- **Solution:** Ensure `fuel-calculator.js` is loaded before `dashboard.js` in `index.html`
- **Check:** Open diagnostics.html to verify fuel calculator functions are available

**Problem: County data not loading**
- **Solution:** Check `data/counties.json` exists and is valid JSON
- **Fallback:** Dashboard will use a minimal county list if JSON fails to load
- **Action:** Click the "Retry" button to attempt reload

**Problem: Map tiles not displaying**
- **Solution:** Dashboard automatically falls back to OpenStreetMap if primary provider fails
- **Note:** Check browser console for tile loading errors

**Problem: Briefs page shows 404**
- **Solution:** Ensure `briefs/index.html` exists and brief files are committed
- **Note:** GitHub Pages is case-sensitive; verify filename matches exactly

### Deployment Notes

- **GitHub Pages is case-sensitive**: Ensure all file references match exact case
- **File paths must be relative**: Use relative paths for assets and links
- **Data files must be committed**: JSON data files must be in the repository

## 👨‍🚒 Five Forks VFD



## 📝 License

MIT License - feel free to adapt for your local fire department or emergency response team.

**Last Updated**: January 2026  
**Maintained by**: Five Forks Fire Weather Team
