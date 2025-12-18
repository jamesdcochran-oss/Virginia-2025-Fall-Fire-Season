#!/usr/bin/env python3
"""
Enhanced FIRMS fire hotspot data fetcher for Virginia Fire Weather Dashboard
Implements multi-satellite support, retry logic, and domain failover
Based on patterns from nasa-wildfires library
"""
import json
import requests
import os
from datetime import datetime
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configuration
FIRMS_API_KEY = os.environ.get('FIRMS_MAP_KEY', '')
BBOX = "36.5,-79,38,-77"  # Virginia bounding box

# Multiple satellite sources
SATELLITES = {
    'MODIS': 'MODIS_NRT',
    'VIIRS_SNPP': 'VIIRS_SNPP_NRT', 
    'VIIRS_NOAA20': 'VIIRS_NOAA20_NRT'
}

# Alternate FIRMS domains for failover
FIRMS_DOMAINS = [
    "https://firms.modaps.eosdis.nasa.gov",
    "https://firms2.modaps.eosdis.nasa.gov"
]


def get_session_with_retries():
    """Create requests session with automatic retry logic"""
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session


def fetch_satellite_data(satellite_id, date_str):
    """
    Fetch data from a specific satellite with domain failover
    Returns list of hotspot dictionaries
    """
    session = get_session_with_retries()
    
    # Try each domain in rotation
    for domain in FIRMS_DOMAINS:
        try:
            url = f"{domain}/api/area/csv/{FIRMS_API_KEY}/{satellite_id}/{BBOX}/1/{date_str}"
            print(f"  Trying {domain}...")
            
            response = session.get(url, timeout=30)
            response.raise_for_status()
            
            # Parse CSV response
            lines = response.text.strip().split('\n')
            if len(lines) < 2:
                print(f"  No data available from {satellite_id}")
                return []
            
            headers = lines[0].split(',')
            hotspots = []
            
            for line in lines[1:]:
                values = line.split(',')
                if len(values) >= len(headers):
                    hotspot = dict(zip(headers, values))
                    
                    # Parse coordinates
                    try:
                        lat = float(hotspot.get('latitude', 0))
                        lon = float(hotspot.get('longitude', 0))
                        
                        # Double-check Virginia bounds
                        if 36 <= lat <= 38 and -79 <= lon <= -76:
                            hotspots.append({
                                'latitude': lat,
                                'longitude': lon,
                                'brightness': float(hotspot.get('brightness', 0)),
                                'acq_date': hotspot.get('acq_date', ''),
                                'acq_time': hotspot.get('acq_time', ''),
                                'confidence': hotspot.get('confidence', ''),
                                'satellite': satellite_id,
                                'frp': float(hotspot.get('frp', 0))  # Fire Radiative Power
                            })
                    except (ValueError, TypeError):
                        continue
            
            print(f"  ✅ Success: {len(hotspots)} hotspots from {satellite_id}")
            return hotspots
            
        except requests.exceptions.RequestException as e:
            print(f"  ⚠️  Failed with {domain}: {e}")
            continue
    
    print(f"  ❌ All domains failed for {satellite_id}")
    return []


def fetch_all_satellites():
    """Fetch fire data from all available satellites"""
    print("Fetching FIRMS fire hotspot data from multiple satellites...")
    date_str = datetime.utcnow().strftime('%Y-%m-%d')
    
    all_hotspots = []
    stats = {}
    
    for sat_name, sat_id in SATELLITES.items():
        print(f"\n📡 {sat_name}...")
        hotspots = fetch_satellite_data(sat_id, date_str)
        all_hotspots.extend(hotspots)
        stats[sat_name] = len(hotspots)
    
    return all_hotspots, stats


def convert_to_geojson(hotspots):
    """
    Convert hotspots to GeoJSON FeatureCollection format
    Compatible with Leaflet.js mapping
    """
    features = []
    
    for hotspot in hotspots:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [hotspot['longitude'], hotspot['latitude']]
            },
            "properties": {
                "brightness": hotspot['brightness'],
                "acq_date": hotspot['acq_date'],
                "acq_time": hotspot['acq_time'],
                "confidence": hotspot['confidence'],
                "satellite": hotspot['satellite'],
                "frp": hotspot['frp']
            }
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }


def deduplicate_hotspots(hotspots):
    """
    Remove duplicate detections from multiple satellites
    Keep the detection with highest confidence
    """
    seen = {}
    
    for hotspot in hotspots:
        key = f"{hotspot['latitude']:.4f},{hotspot['longitude']:.4f}"
        
        if key not in seen:
            seen[key] = hotspot
        else:
            # Keep detection with higher confidence
            existing_conf = seen[key].get('confidence', 'low')
            new_conf = hotspot.get('confidence', 'low')
            
            confidence_order = {'low': 1, 'nominal': 2, 'high': 3}
            if confidence_order.get(new_conf, 0) > confidence_order.get(existing_conf, 0):
                seen[key] = hotspot
    
    return list(seen.values())


def main():
    """Main execution function"""
    if not FIRMS_API_KEY:
        print("❌ ERROR: FIRMS_MAP_KEY environment variable not set")
        return
    
    # Fetch from all satellites
    all_hotspots, stats = fetch_all_satellites()
    
    # Remove duplicates
    unique_hotspots = deduplicate_hotspots(all_hotspots)
    
    print(f"\n📊 Statistics:")
    for sat_name, count in stats.items():
        print(f"  {sat_name}: {count} detections")
    print(f"  Total raw: {len(all_hotspots)} detections")
    print(f"  After deduplication: {len(unique_hotspots)} unique hotspots")
    
    # Generate timestamp
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # JSON output (backward compatible with your existing dashboard)
    json_output = {
        "lastUpdated": timestamp,
        "count": len(unique_hotspots),
        "hotspots": unique_hotspots,
        "statistics": stats
    }
    
    with open('firms_data.json', 'w') as f:
        json.dump(json_output, f, indent=2)
    
    # GeoJSON output (for enhanced Leaflet integration)
    geojson_output = convert_to_geojson(unique_hotspots)
    with open('firms_data.geojson', 'w') as f:
        json.dump(geojson_output, f, indent=2)
    
    print(f"\n✅ Successfully saved FIRMS data:")
    print(f"   - firms_data.json ({len(unique_hotspots)} hotspots)")
    print(f"   - firms_data.geojson (Leaflet-ready)")


if __name__ == "__main__":
    main()
