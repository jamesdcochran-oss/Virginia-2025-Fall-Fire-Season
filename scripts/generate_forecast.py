#!/usr/bin/env python3
"""
Fire Weather Forecast Generator
Virg inia Department of Forestry
Generates daily fire weather forecasts
"""

import os
from datetime import datetime

# Create forecasts directory if it doesn't exist
os.makedirs('forecasts', exist_ok=True)

# Generate today's forecast
today = datetime.now()
forecast_date = today.strftime('%B %d, %Y')

# Simple HTML template with your fire forecast data
html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Five Forks Fire Weather Forecast - {forecast_date}</title>
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
        <div class="subtitle">{forecast_date} - Daily Forecast</div>
        <div class="subtitle">Counties: Amelia, Brunswick, Dinwiddie, Greensville, Nottoway, Prince George</div>
    </div>
    
    <div class="forecast-grid">
        <div class="day-card">
            <div class="day-header">Today - October 24</div>
            <div class="danger-level level-low">Class 1: LOW</div>
            <div class="weather-params">
                <div class="param-row">
                    <span class="param-label">High Temperature:</span>
                    <span class="param-value">62-65°F</span>
                </div>
                <div class="param-row">
                    <span class="param-label">Min RH:</span>
                    <span class="param-value">30-35%</span>
                </div>
                <div class="param-row">
                    <span class="param-label">Wind Speed:</span>
                    <span class="param-value">5-10 mph NNW</span>
                </div>
                <div class="param-row">
                    <span class="param-label">Conditions:</span>
                    <span class="param-value">Mostly Sunny</span>
                </div>
            </div>
        </div>
        
        <div class="day-card">
            <div class="day-header">Tomorrow - October 25</div>
            <div class="danger-level level-moderate">Class 2: MODERATE</div>
            <div class="weather-params">
                <div class="param-row">
                    <span class="param-label">High Temperature:</span>
                    <span class="param-value">61-66°F</span>
                </div>
                <div class="param-row">
                    <span class="param-label">Min RH:</span>
                    <span class="param-value">28-32%</span>
                </div>
                <div class="param-row">
                    <span class="param-label">Wind Speed:</span>
                    <span class="param-value">5-10 mph NNW</span>
                </div>
                <div class="param-row">
                    <span class="param-label">Conditions:</span>
                    <span class="param-value">Partly Cloudy</span>
                </div>
            </div>
        </div>
        
        <div class="day-card">
            <div class="day-header">Sunday - October 26</div>
            <div class="danger-level level-moderate">Class 2: MODERATE</div>
            <div class="weather-params">
                <div class="param-row">
                    <span class="param-label">High Temperature:</span>
                    <span class="param-value">61-66°F</span>
                </div>
                <div class="param-row">
                    <span class="param-label">Min RH:</span>
                    <span class="param-value">32-38%</span>
                </div>
                <div class="param-row">
                    <span class="param-label">Wind Speed:</span>
                    <span class="param-value">5-8 mph W to NW</span>
                </div>
                <div class="param-row">
                    <span class="param-label">Conditions:</span>
                    <span class="param-value">Partly Cloudy</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="update-time">
        Last Updated: {today.strftime('%Y-%m-%d %I:%M %p EDT')}<br>
        Generated automatically via GitHub Actions
    </div>
</body>
</html>
"""

# Write the HTML file
with open('forecasts/current-forecast.html', 'w') as f:
    f.write(html_content)

print(f"✅ Forecast generated successfully: forecasts/current-forecast.html")
print(f"📅 Generated at: {today.strftime('%Y-%m-%d %H:%M:%S')}")
