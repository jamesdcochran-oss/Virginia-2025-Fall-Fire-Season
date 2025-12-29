#!/usr/bin/env python3
import os
import json
from datetime import datetime, timedelta

os.makedirs('forecasts', exist_ok=True)

# Calculate dates for 3-day forecast
today = datetime.now()
day1 = today
day2 = today + timedelta(days=1)
day3 = today + timedelta(days=2)
issue_date = today - timedelta(days=1)

# Format dates
date_range = f"{day1.strftime('%B %d')}–{day3.strftime('%d, %Y')}"
day1_str = day1.strftime('%A, %B %d, %Y')
day2_str = day2.strftime('%A, %B %d, %Y')
day3_str = day3.strftime('%A, %B %d, %Y')
issue_date_str = issue_date.strftime('%A, %B %d, %Y')

# Short day names for headers
day1_short = day1.strftime('%a %d')
day2_short = day2.strftime('%a %d')
day3_short = day3.strftime('%a %d')

# Generate forecast data
forecast_data = {
    "dates": date_range,
    "counties": ["Amelia","Brunswick","Dinwiddie","Greensville","Nottoway","Prince George"],
    "overview": f"Three-day fire weather forecast for the Five Forks District. Conditions generated on {today.strftime('%B %d, %Y')}.",
    "csiNote": "CSI coverage note: The Farmville (Central Region) applies to areas including Nottoway and Amelia Counties, while the Petersburg (Five Forks District) applies to the remainder of the Five Forks service area (Brunswick, Dinwiddie, Greensville, Prince George).",
    "classes": [
        { "county": "Amelia", "day1Local": 2, "day1DOF": "2 (Farmville)", "day2Local": 2, "day2DOF": "2 (Farmville)", "day3Local": "1–2", "day3DOF": "2 (Farmville)" },
        { "county": "Brunswick", "day1Local": 2, "day1DOF": "2 (Petersburg)", "day2Local": 2, "day2DOF": "2 (Petersburg)", "day3Local": "1–2", "day3DOF": "2 (Petersburg)" },
        { "county": "Dinwiddie", "day1Local": 2, "day1DOF": "2 (Petersburg)", "day2Local": 2, "day2DOF": "2 (Petersburg)", "day3Local": "1–2", "day3DOF": "2 (Petersburg)" },
        { "county": "Greensville", "day1Local": 2, "day1DOF": "2 (Petersburg)", "day2Local": 2, "day2DOF": "2 (Petersburg)", "day3Local": "1–2", "day3DOF": "2 (Petersburg)" },
        { "county": "Nottoway", "day1Local": 2, "day1DOF": "2 (Farmville)", "day2Local": 2, "day2DOF": "2 (Farmville)", "day3Local": "1–2", "day3DOF": "2 (Farmville)" },
        { "county": "Prince George", "day1Local": 2, "day1DOF": "2 (Petersburg)", "day2Local": 2, "day2DOF": "2 (Petersburg)", "day3Local": "1–2", "day3DOF": "2 (Petersburg)" }
    ]
}

# Save JSON data
with open('forecasts/forecast_data.json', 'w') as f:
    json.dump(forecast_data, f, indent=2)

print(f"✅ Forecast data generated: forecasts/forecast_data.json")
print(f"📅 {today.strftime('%Y-%m-%d %H:%M:%S')}")
