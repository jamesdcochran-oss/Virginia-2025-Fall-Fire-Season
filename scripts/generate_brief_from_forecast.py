#!/usr/bin/env python3
"""Generate Fire Weather Brief Input from Forecast Data"""
import json
import requests
from datetime import datetime, timedelta

COUNTIES = [
    {"name": "Dinwiddie", "lat": 37.0751, "lon": -77.5831},
    {"name": "Brunswick", "lat": 36.7168, "lon": -77.8500},
    {"name": "Greensville", "lat": 36.6835, "lon": -77.5664},
    {"name": "Amelia", "lat": 37.3500, "lon": -77.9700},
    {"name": "Prince George", "lat": 37.1835, "lon": -77.2831},
    {"name": "Nottoway", "lat": 37.1000, "lon": -78.0700}
]

print("Fire weather brief generator - see repo for full code")
