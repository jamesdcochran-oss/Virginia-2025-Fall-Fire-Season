#!/usr/bin/env python3
"""
Generate daily briefs (HTML) from repo data.

- Reads data/counties.json
- Optionally reads data/weather.json (county keyed) if present
- Computes DOF readiness score per provided DOF method
- Writes briefs/brief-YYYY-MM-DD.html and updates briefs/index.html
"""

import json
import os
import datetime

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(REPO_ROOT, "data")
BRIEFS_DIR = os.path.join(REPO_ROOT, "briefs")
COUNTIES_FILE = os.path.join(DATA_DIR, "counties.json")
WEATHER_FILE = os.path.join(DATA_DIR, "weather.json")  # optional per-county weather snapshots

os.makedirs(BRIEFS_DIR, exist_ok=True)

def load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return None

def days_since_rain_weight(days):
    if days <= 1: return 1
    if days == 2: return 2
    if days == 3: return 3
    if days == 4: return 4
    return 5

def rainfall_correction(amount_inches):
    if amount_inches is None: return 0
    if amount_inches >= 0.5: return -4
    if amount_inches >= 0.25: return -3
    if amount_inches >= 0.10: return -2
    if amount_inches >= 0.01: return -1
    return 0

def temp_weight(f):
    if f is None: return 0
    if f > 86: return 5
    if 76 <= f <= 85: return 4
    if 66 <= f <= 75: return 3
    if 58 <= f <= 65: return 2
    if 50 <= f <= 57: return 1
    return 0

def rh_weight(rh):
    if rh is None: return 0
    if rh <= 19: return 5
    if 20 <= rh <= 29: return 4
    if 30 <= rh <= 39: return 3
    if 40 <= rh <= 59: return 2
    if 60 <= rh <= 90: return 1
    return 0

def wind_weight(mph):
    if mph is None: return 0
    if mph >= 26: return 5
    if 21 <= mph <= 25: return 4
    if 16 <= mph <= 20: return 3
    if 11 <= mph <= 15: return 2
    return 1

def csi_weight(csi):
    if csi is None: return 0
    if 700 <= csi <= 800: return 3
    if 600 <= csi <= 699: return 2
    if 450 <= csi <= 599: return 1
    return 0

def greenup_weight(g):
    # Accepts a string or None; map common conditions
    if not g: return 0
    g = g.lower()
    if "oak leaves full" in g or "full" in g: return -5
    if "oak leaves 1 inch" in g or "1 inch" in g: return -3
    if "25% leaves off" in g: return -3
    if "75% leaves off" in g: return 0
    return 0

def readiness_level(sum_score):
    if sum_score <= 8: return (1, "Low")
    if 9 <= sum_score <= 11: return (2, "Moderate")
    if 12 <= sum_score <= 15: return (3, "High")
    if 16 <= sum_score <= 18: return (4, "Very High")
    return (5, "Extreme")

def make_brief(counties, weather_map, date_str):
    rows = []
    for c in counties:
        name = c.get("name")
        w = weather_map.get(name, {})
        days = w.get("days_since_rain")
        rain = w.get("rainfall_inches")
        temp_f = w.get("temp_f")
        rh = w.get("min_rh")
        wind = w.get("wind_mph")
        csi = w.get("csi")
        greenup = w.get("greenup")

        s = 0
        s += days_since_rain_weight(days if days is not None else 0)
        s += rainfall_correction(rain)
        s += temp_weight(temp_f)
        s += rh_weight(rh)
        s += wind_weight(wind)
        s += csi_weight(csi)
        s += greenup_weight(greenup)

        level_num, level_label = readiness_level(s)
        rows.append({
            "county": name,
            "score": s,
            "level_num": level_num,
            "level_label": level_label,
            "days_since_rain": days,
            "rainfall_inches": rain,
            "temp_f": temp_f,
            "min_rh": rh,
            "wind_mph": wind,
            "csi": csi
        })
    # Build HTML
    title = f"Five Forks Fire Weather Brief — {date_str}"
    html_rows = ""
    for r in rows:
        html_rows += f"""
        <tr>
          <td>{r['county']}</td>
          <td>{r['level_num']} ({r['level_label']})</td>
          <td>{r['temp_f'] or 'n/a'}</td>
          <td>{r['min_rh'] or 'n/a'}</td>
          <td>{r['wind_mph'] or 'n/a'}</td>
          <td>{r['days_since_rain'] or 'n/a'}</td>
          <td>{r['rainfall_inches'] if r['rainfall_inches'] is not None else 'n/a'}</td>
        </tr>
        """
    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>
body{{font-family:system-ui,Arial;margin:18px;color:#111}}
table{{border-collapse:collapse;width:100%;max-width:1100px}}
th,td{{border:1px solid #ddd;padding:8px;text-align:left}}
th{{background:#f4f4f4}}
.level-1{{background:#cfeef0}}
.level-2{{background:#fff3bf}}
.level-3{{background:#ffd8b8}}
.level-4{{background:#ffb4a2}}
.level-5{{background:#ff9a9a}}
</style>
</head>
<body>
<h1>{title}</h1>
<p>Generated: {date_str}</p>
<table>
<thead>
<tr><th>County</th><th>DOF Readiness</th><th>Temp (°F)</th><th>Min RH (%)</th><th>Wind (mph)</th><th>Days since rain</th><th>Rain (in)</th></tr>
</thead>
<tbody>
{html_rows}
</tbody>
</table>
</body></html>"""
    return html

def main():
    counties = load_json(COUNTIES_FILE) or []
    weather_map = {}
    wf = load_json(WEATHER_FILE)
    if wf:
        # expected shape: { "Amelia": { "temp_f":..., ... }, ... }
        weather_map = wf
    else:
        # create placeholder entries
        for c in counties:
            weather_map[c.get("name")] = {
                "days_since_rain": None,
                "rainfall_inches": None,
                "temp_f": None,
                "min_rh": None,
                "wind_mph": None,
                "csi": None,
                "greenup": None
            }

    today = datetime.date.today()
    date_str = today.isoformat()
    filename = f"brief-{date_str}.html"
    outpath = os.path.join(BRIEFS_DIR, filename)
    html = make_brief(counties, weather_map, date_str)
    with open(outpath, "w", encoding="utf-8") as fh:
        fh.write(html)

    # Update index.html to point to latest brief
    index_path = os.path.join(BRIEFS_DIR, "index.html")
    index_html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Briefs</title></head><body>
<h1>Daily Briefs</h1>
<ul>
<li><a href="./{filename}">Brief {date_str}</a></li>
</ul>
</body></html>"""
    with open(index_path, "w", encoding="utf-8") as fh:
        fh.write(index_html)

    print("WROTE", outpath, "and", index_path)

if __name__ == "__main__":
    main()
