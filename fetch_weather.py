#!/usr/bin/env python3
"""
Five Forks Fire Weather Data Fetcher
Fetches live NWS weather data for counties and calculates fire danger class
"""

import json
import requests
from datetime import datetime
import time

# County data with centroids
COUNTIES = [
    {"name": "Dinwiddie", "lat": 37.0751, "lon": -77.5831},
    {"name": "Brunswick", "lat": 36.7168, "lon": -77.8500},
    {"name": "Greensville", "lat": 36.6835, "lon": -77.5664},
    {"name": "Amelia", "lat": 37.3500, "lon": -77.9700}},
        {"name": "Prince George", "lat": 37.1835, "lon": -77.2831},
    {"name": "Nottoway", "lat": 37.1000, "lon": -78.0700}]

# Fire danger thresholds for alerting
ALERT_THRESHOLDS = {"gust": 18, "rh": 30}

def fetch_nws_data(lat, lon):
    """Fetch latest observation from NWS API"""
    try:
        points_url = f"https://api.weather.gov/points/{lat},{lon}"
        headers = {"User-Agent": "(Five Forks Fire Weather Dashboard, contact@example.com)"}
        
        response = requests.get(points_url, headers=headers, timeout=10)
        response.raise_for_status()
        points_data = response.json()
        
        obs_stations_url = points_data['properties']['observationStations']
        response = requests.get(obs_stations_url, headers=headers, timeout=10)
        response.raise_for_status()
        stations = response.json()
        
        if not stations['features']:
            return None
            
        station_id = stations['features'][0]['properties']['stationIdentifier']
        obs_url = f"https://api.weather.gov/stations/{station_id}/observations/latest"
        
        response = requests.get(obs_url, headers=headers, timeout=10)
        response.raise_for_status()
        obs_data = response.json()
        
        props = obs_data['properties']
        
        temp_c = props.get('temperature', {}).get('value')
        temp_f = (temp_c * 9/5) + 32 if temp_c else None
        
        rh = props.get('relativeHumidity', {}).get('value')
        
        dew_c = props.get('dewpoint', {}).get('value')
        dew_f = (dew_c * 9/5) + 32 if dew_c else None
        
        wind_ms = props.get('windSpeed', {}).get('value')
        wind_mph = wind_ms * 2.237 if wind_ms else None
        
        gust_ms = props.get('windGust', {}).get('value')
        gust_mph = gust_ms * 2.237 if gust_ms else None
        
        return {
            "temp": round(temp_f) if temp_f else None,
            "rh": round(rh) if rh else None,
            "dewPoint": round(dew_f) if dew_f else None,
            "wind": round(wind_mph) if wind_mph else None,
            "gust": round(gust_mph) if gust_mph and gust_mph > 0 else (round(wind_mph * 1.3) if wind_mph else None)
        }
        
    except Exception as e:
        print(f"Error fetching NWS data for {lat},{lon}: {e}")
        return None

def calculate_fire_danger_class(temp, rh, wind, gust):
    """Calculate fire danger class based on weather conditions"""
    if None in [temp, rh, wind]:
        return 2
    
    score = 0
    if temp >= 85:
        score += 3
    elif temp >= 75:
        score += 2
    elif temp >= 65:
        score += 1
    
    if rh <= 20:
        score += 3
    elif rh <= 30:
        score += 2
    elif rh <= 40:
        score += 1
    
    wind_speed = gust if gust else wind
    if wind_speed >= 20:
        score += 3
    elif wind_speed >= 15:
        score += 2
    elif wind_speed >= 10:
        score += 1
    
    if score >= 8:
        return 5
    elif score >= 6:
        return 4
    elif score >= 4:
        return 3
    elif score >= 2:
        return 2
    else:
        return 1

def check_alerts(county_data):
    """Check if any counties exceed alert thresholds"""
    alerts = []
    for county in county_data:
        if county['gust'] and county['gust'] > ALERT_THRESHOLDS['gust']:
            alerts.append(f"{county['name']}: High gusts ({county['gust']} mph)")
        if county['rh'] and county['rh'] < ALERT_THRESHOLDS['rh']:
            alerts.append(f"{county['name']}: Low humidity ({county['rh']}%)")
    return alerts

def main():
    """Main execution"""
    print("Fetching weather data for Five Forks counties...")
    
    county_data = []
    
    for county in COUNTIES:
        print(f"Fetching data for {county['name']}...")
        weather = fetch_nws_data(county['lat'], county['lon'])
        
        if weather:
            danger_class = calculate_fire_danger_class(
                weather['temp'], weather['rh'], weather['wind'], weather['gust'])
            
            county_data.append({
                "name": county['name'],
                "temp": weather['temp'],
                "rh": weather['rh'],
                "dewPoint": weather['dewPoint'],
                "wind": weather['wind'],
                "gust": weather['gust'],
                "dangerClass": danger_class
            })
        else:
            print(f"  Warning: Could not fetch data for {county['name']}")
        
        time.sleep(1)
    
    alerts = check_alerts(county_data)
    if alerts:
        print("\n⚠️  ALERTS:")
        for alert in alerts:
            print(f"  - {alert}")
    
    output = {
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "counties": county_data,
        "alerts": alerts
    }
    
    with open('county_data.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Successfully updated data for {len(county_data)} counties")
    print(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
