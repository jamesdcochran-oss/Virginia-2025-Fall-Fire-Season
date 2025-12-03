#!/usr/bin/env python3
"""Generate Fire Weather Brief Input from Forecast Data"""
import json
from datetime import datetime
import os

def map_danger_class_to_level(danger_class):
    """Map numeric danger class to text level"""
    danger_map = {
        1: "Low",
        2: "Moderate",
        3: "High",
        4: "Very High",
        5: "Extreme"
    }
    return danger_map.get(danger_class, "Unknown")

def generate_brief_input():
    """Read county_data.json and generate fire_weather_brief_input.json"""
    
    # Read county data
    input_file = 'county_data.json'
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        return False
    
    with open(input_file, 'r') as f:
        data = json.load(f)
        county_data = data.get("counties", [])
    
    # Transform data for brief generation
    counties_list = []
    for county in county_data:
        counties_list.append({
            "name": county.get("name", "Unknown"),
            "temp_f": county.get("temp", 0),
            "rh_percent": county.get("rh", 0),
            "dew_point_f": county.get("dewPoint", 0),
            "wind_mph": county.get("wind", 0),
            "gust_mph": county.get("gust", 0),
                        "danger_class": county.get("dangerClass", 1),
                        "danger_level": map_danger_class_to_level(county.get("dangerClass", 1))
                    })
    
    # Create output structure
    output_data = {
        "generated": datetime.utcnow().isoformat() + "Z",
                "meta": {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "source": "NWS API",
            "region": "Virginia Fire Districts"
        },
        "counties": counties_list
    }
    
    # Write output file
    output_file = 'fire_weather_brief_input.json'
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"Generated {output_file} with {len(counties_list)} counties")
    return True

if __name__ == "__main__":
    success = generate_brief_input()
    exit(0 if success else 1)
