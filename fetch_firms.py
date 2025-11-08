#!/usr/bin/env python3
"""Fetch FIRMS fire hotspot data from NASA API"""
import json
import requests
import os
from datetime import datetime

FIRMS_API_KEY = os.environ.get('FIRMS_MAP_KEY', '')
BBOX = "36.5,-79,38,-77"  # Virginia bounding box

def fetch_firms_data():
    """Fetch latest FIRMS fire hotspot data"""
    try:
        date_str = datetime.utcnow().strftime('%Y-%m-%d')
        url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{FIRMS_API_KEY}/VIIRS_NOAA20_NRT/{BBOX}/1/{date_str}"
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        lines = response.text.strip().split('\n')
        if len(lines) < 2:
            print("No fire data available")
            return []
        
        headers = lines[0].split(',')
        hotspots = []
        
        for line in lines[1:]:
            values = line.split(',')
            if len(values) >= len(headers):
                hotspot = dict(zip(headers, values))
                lat = float(hotspot.get('latitude', 0))
                lon = float(hotspot.get('longitude', 0))
                if 36 <= lat <= 38 and -79 <= lon <= -76:
                    hotspots.append({
                        'latitude': lat,
                        'longitude': lon,
                        'brightness': float(hotspot.get('brightness', 0)),
                        'acq_date': hotspot.get('acq_date', ''),
                        'acq_time': hotspot.get('acq_time', ''),
                        'confidence': hotspot.get('confidence', '')
                    })
        
        return hotspots
    except Exception as e:
        print(f"Error fetching FIRMS data: {e}")
        return []

def main():
    print("Fetching FIRMS fire hotspot data...")
    hotspots = fetch_firms_data()
    
    output = {
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "count": len(hotspots),
        "hotspots": hotspots
    }
    
    with open('firms_data.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"✅ Successfully fetched {len(hotspots)} fire hotspots")

if __name__ == "__main__":
    main()
