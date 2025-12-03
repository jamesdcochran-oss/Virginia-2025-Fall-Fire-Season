#!/usr/bin/env python3
"""Check for critical fire weather conditions and create alerts"""

import json
import sys
from datetime import datetime

# Alert thresholds
WIND_THRESHOLD = 18  # mph
HUMIDITY_THRESHOLD = 30  # percent
TEMP_THRESHOLD = 80  # Fahrenheit

def check_county_alerts(county_data):
    """Check if a county meets alert criteria"""
    alerts = []
    
    name = county_data.get('name', 'Unknown')
    wind = county_data.get('wind', 0)
    gust = county_data.get('gust', 0)
    rh = county_data.get('rh', 100)
    temp = county_data.get('temp_f', 0)
    
    # Check wind conditions
    if gust >= WIND_THRESHOLD:
        alerts.append(f"💨 High wind gusts: {gust} mph (threshold: {WIND_THRESHOLD} mph)")
    elif wind >= WIND_THRESHOLD:
        alerts.append(f"🌬️ High winds: {wind} mph (threshold: {WIND_THRESHOLD} mph)")
    
    # Check humidity
    if rh <= HUMIDITY_THRESHOLD:
        alerts.append(f"💧 Low humidity: {rh}% (threshold: {HUMIDITY_THRESHOLD}%)")
    
    # Check temperature
    if temp >= TEMP_THRESHOLD:
        alerts.append(f"🌡️ High temperature: {temp}°F (threshold: {TEMP_THRESHOLD}°F)")
    
    return alerts

def main():
    try:
        # Load county data
        with open('county_data.json', 'r') as f:
            data = json.load(f)
        
        counties = data.get('counties', [])
        last_updated = data.get('lastUpdated', 'Unknown')
        
        # Check each county for alerts
        critical_counties = []
        
        for county in counties:
            alerts = check_county_alerts(county)
            if alerts:
                critical_counties.append({
                    'county': county.get('name', 'Unknown'),
                    'alerts': alerts,
                    'conditions': {
                        'temp': county.get('temp_f'),
                        'rh': county.get('rh'),
                        'wind': county.get('wind'),
                        'gust': county.get('gust')
                    }
                })
        
        # Output results
        if critical_counties:
            print(f"⚠️ CRITICAL FIRE WEATHER CONDITIONS DETECTED")
            print(f"Time: {last_updated}")
            print(f"\nCounties with alerts: {len(critical_counties)}\n")
            
            for item in critical_counties:
                print(f"=== {item['county']} County ===")
                for alert in item['alerts']:
                    print(f"  {alert}")
                cond = item['conditions']
                print(f"  Current: {cond['temp']}°F, {cond['rh']}% RH, Wind {cond['wind']} mph, Gust {cond['gust']} mph")
                print()
            
            # Exit with code 1 to indicate alerts found
            sys.exit(1)
        else:
            print("✅ No critical conditions detected")
            print(f"Last updated: {last_updated}")
            sys.exit(0)
            
    except FileNotFoundError:
        print("❌ Error: county_data.json not found")
        sys.exit(2)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(2)

if __name__ == '__main__':
    main()
