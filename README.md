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
- **Auto-Deploy**: Updates publish automatically to GitHub Pages

## 👨‍🚒 Five Forks VFD



## 📝 License

MIT License - feel free to adapt for your local fire department or emergency response team.

**Last Updated**: December 2025  
**Maintained by**: Five Forks Fire Weather Team
