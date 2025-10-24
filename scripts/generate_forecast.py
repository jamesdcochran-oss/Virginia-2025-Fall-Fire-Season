#!/usr/bin/env python3
"""
Daily Five Forks Fire Weather Forecast Generator
Virginia Department of Forestry Fire Readiness Level Calculator
"""

import os
import requests
from datetime import datetime, timedelta
import pandas as pd

# Counties in Five Forks region
COUNTIES = ['Amelia', 'Brunswick', 'Dinwiddie', 'Greensville', 'Nottoway', 'Prince George']

# Weather station coordinates (example for Dinwiddie area)
WEATHER_STATIONS = {
    'Amelia': {'lat': 37.3391, 'lon': -77.9757},
    'Brunswick': {'lat': 36.7160, 'lon': -77.8456},
    'Dinwiddie': {'lat': 37.0760, 'lon': -77.5831},
    'Greensville': {'lat': 36.6854, 'lon': -77.5694},
    'Nottoway': {'lat': 37.1293, 'lon': -78.0703},
    'Prince George': {'lat': 37.2196, 'lon': -77.2881}
}

def fetch_weather_data(lat, lon):
    """Fetch weather forecast from National Weather Service API"""
    # NWS API endpoint (free, no key required)
    point_url = f"https://api.weather.gov/points/{lat},{lon}"
    
    try:
        response = requests.get(point_url, headers={'User-Agent': 'FireWeatherForecast/1.0'})
        response.raise_for_status()
        point_data = response.json()
        
        forecast_url = point_data['properties']['forecast']
        forecast_response = requests.get(forecast_url, headers={'User-Agent': 'FireWeatherForecast/1.0'})
        forecast_response.raise_for_status()
        
        return forecast_response.json()
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return None

def calculate_fire_readiness(days_since_rain, rainfall_correction, max_temp, min_rh, wind_speed, csi):
    """Calculate fire readiness level using Virginia DOF method"""
    
    # Step 1: Days Since Rainfall
    days_factor = min(days_since_rain, 5) + rainfall_correction
    days_factor = max(0, days_factor)
    
    # Step 2: Temperature
    if max_temp > 86:
        temp_factor = 5
    elif max_temp >= 76:
        temp_factor = 4
    elif max_temp >= 66:
        temp_factor = 3
    elif max_temp >= 58:
        temp_factor = 2
    elif max_temp >= 50:
        temp_factor = 1
    else:
        temp_factor = 0
    
    # Step 3: Relative Humidity
    if min_rh <= 19:
        rh_factor = 5
    elif min_rh <= 29:
        rh_factor = 4
    elif min_rh <= 39:
        rh_factor = 3
    elif min_rh <= 59:
        rh_factor = 2
    elif min_rh <= 90:
        rh_factor = 1
    else:
        rh_factor = 0
    
    # Step 4: Wind Speed
    if wind_speed >= 26:
        wind_factor = 5
    elif wind_speed >= 21:
        wind_factor = 4
    elif wind_speed >= 16:
        wind_factor = 3
    elif wind_speed >= 11:
        wind_factor = 2
    else:
        wind_factor = 1
    
    # Step 5: CSI
    if csi >= 700:
        csi_factor = 3
    elif csi >= 600:
        csi_factor = 2
    elif csi >= 450:
        csi_factor = 1
    else:
        csi_factor = 0
    
    # Step 6: Green-up Factor (Fall: 25% leaves off)
    greenup_factor = -3
    
    # Total and Classification
    total = days_factor + temp_factor + rh_factor + wind_factor + csi_factor + greenup_factor
    
    if total <= 8:
        level = 'I (Low)'
    elif total <= 11:
        level = 'II (Moderate)'
    elif total <= 15:
        level = 'III (High)'
    elif total <= 18:
        level = 'IV (Very High)'
    else:
        level = 'V (Extreme)'
    
    return {
        'total': total,
        'level': level,
        'days_factor': days_factor,
        'temp_factor': temp_factor,
        'rh_factor': rh_factor,
        'wind_factor': wind_factor,
        'csi_factor': csi_factor,
        'greenup_factor': greenup_factor
    }

def generate_html_forecast():
    """Generate HTML forecast document"""
    
    today = datetime.now()
    forecast_dates = [today, today + timedelta(days=1), today + timedelta(days=2)]
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Five Forks Fire Weather Forecast - {today.strftime('%B %d, %Y')}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .header {{
            background: linear-gradient(135deg, #d32f2f 0%, #f57c00 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        h1 {{
            margin: 0;
            font-size: 2.5em;
        }}
        .subtitle {{
            margin-top: 10px;
            font-size: 1.1em;
            opacity: 0.9;
        }}
        .forecast-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }}
        .day-card {{
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        .day-header {{
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 3px solid #e0e0e0;
        }}
        .danger-level {{
            font-size: 1.8em;
            font-weight: bold;
            margin: 15px 0;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }}
        .level-low {{ background-color: #4caf50; color: white; }}
        .level-moderate {{ background-color: #ff9800; color: white; }}
        .level-high {{ background-color: #f44336; color: white; }}
        .level-veryhigh {{ background-color: #c62828; color: white; }}
        .level-extreme {{ background-color: #6a1b9a; color: white; }}
        .weather-params {{
            margin-top: 20px;
        }}
        .param-row {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }}
        .param-label {{
            font-weight: bold;
            color: #555;
        }}
        .param-value {{
            color: #333;
        }}
        .update-time {{
            text-align: center;
            color: #666;
            margin-top: 30px;
            font-style: italic;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        th, td {{
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }}
        th {{
            background-color: #424242;
            color: white;
            font-weight: bold;
        }}
        tr:hover {{
            background-color: #f5f5f5;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🔥 Five Forks Fire Weather Forecast</h1>
        <div class="subtitle">{today.strftime('%A, %B %d, %Y')} - Next 3 Days</div>
        <div class="subtitle">Counties: Amelia, Brunswick, Dinwiddie, Greensville, Nottoway, Prince George</div>
    </div>
    
    <!-- Forecast content would go here -->
    
    <div class="update-time">
        Last Updated: {datetime.now().strftime('%Y-%m-%d %I:%M %p EDT')}<br>
        Generated automatically via GitHub Actions
    </div>
</body>
</html>
"""
    
    # Save HTML file
    os.makedirs('forecasts', exist_ok=True)
    with open('forecasts/current-forecast.html', 'w') as f:
        f.write(html_content)
    
    print("✅ Forecast generated successfully!")

if __name__ == "__main__":
    generate_html_forecast()
