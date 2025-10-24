#!/usr/bin/env python3
import os
from datetime import datetime

os.makedirs('forecasts', exist_ok=True)
today = datetime.now()

html = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width">
<title>Five Forks Fire Weather Forecast</title>
<style>
body {{font-family:Arial,sans-serif; max-width:1200px; margin:0 auto; padding:20px; background:#f5f5f5;}}
.header {{background:linear-gradient(135deg,#d32f2f,#f57c00); color:white; padding:30px; border-radius:10px; margin-bottom:30px;}}
h1 {{margin:0; font-size:2.5em;}}
.subtitle {{margin-top:10px; font-size:1.1em; opacity:0.9;}}
.section {{background:white; padding:20px; margin:20px 0; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1);}}
table {{width:100%; border-collapse:collapse; margin:15px 0;}}
th,td {{padding:12px; text-align:left; border-bottom:1px solid #ddd;}}
th {{background:#424242; color:white; font-weight:bold;}}
.low {{background:#4caf50; color:white; padding:10px; border-radius:5px; text-align:center; font-weight:bold;}}
.moderate {{background:#ff9800; color:white; padding:10px; border-radius:5px; text-align:center; font-weight:bold;}}
.day {{display:inline-block; width:32%; margin:1%; padding:15px; background:white; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1); vertical-align:top;}}
.param {{display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;}}
.label {{font-weight:bold; color:#555;}}
</style>
</head>
<body>
<div class="header">
<h1>🔥 Five Forks Fire Weather Forecast</h1>
<div class="subtitle">October 24–26, 2025 | Operational Briefing</div>
<div class="subtitle">Counties: Amelia, Brunswick, Dinwiddie, Greensville, Nottoway, Prince George</div>
</div>

<div class="section">
<h2>Daily Fire Danger Class Summary</h2>
<table>
<tr><th>County</th><th>Oct 24 Local</th><th>Oct 24 DOF</th><th>Oct 25 Local</th><th>Oct 25 DOF</th><th>Oct 26 Local</th><th>Oct 26 DOF</th></tr>
<tr><td>Amelia</td><td>1 - Low</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td></tr>
<tr><td>Brunswick</td><td>1 - Low</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td></tr>
<tr><td>Dinwiddie</td><td>1 - Low</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td></tr>
<tr><td>Greensville</td><td>1 - Low</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td></tr>
<tr><td>Nottoway</td><td>1 - Low</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td></tr>
<tr><td>Prince George</td><td>1 - Low</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td><td>2 - Moderate</td><td>1 - Low</td></tr>
</table>
</div>

<div class="section">
<h2>Friday, October 24, 2025</h2>
<div class="day">
<div class="moderate">CLASS I: LOW</div>
<div class="param"><span class="label">Temp High:</span> 62-65°F</div>
<div class="param"><span class="label">Temp Low:</span> 34-40°F</div>
<div class="param"><span class="label">Min RH:</span> 30-35%</div>
<div class="param"><span class="label">Wind:</span> 5-10 mph NNW</div>
<div class="param"><span class="label">Sky:</span> Mostly sunny</div>
<div class="param"><span class="label">Precip:</span> 0.00 in</div>
<div class="param"><span class="label">KBDI:</span> 410-420</div>
<div class="param"><span class="label">CSI:</span> 520</div>
</div>

<div class="day">
<div class="low">CLASS II: MODERATE</div>
<div class="param"><span class="label">Temp High:</span> 61-66°F</div>
<div class="param"><span class="label">Temp Low:</span> 37-45°F</div>
<div class="param"><span class="label">Min RH:</span> 28-32%</div>
<div class="param"><span class="label">Wind:</span> 5-10 mph NNW</div>
<div class="param"><span class="label">Sky:</span> Partly cloudy</div>
<div class="param"><span class="label">Precip:</span> 0.00 in</div>
<div class="param"><span class="label">KBDI:</span> 420-430</div>
<div class="param"><span class="label">CSI:</span> 530</div>
</div>

<div class="day">
<div class="low">CLASS II: MODERATE</div>
<div class="param"><span class="label">Temp High:</span> 61-66°F</div>
<div class="param"><span class="label">Temp Low:</span> 39-46°F</div>
<div class="param"><span class="label">Min RH:</span> 32-38%</div>
<div class="param"><span class="label">Wind:</span> 5-8 mph W/NW</div>
<div class="param"><span class="label">Sky:</span> Partly cloudy</div>
<div class="param"><span class="label">Precip:</span> 0.00 in</div>
<div class="param"><span class="label">KBDI:</span> 430-440</div>
<div class="param"><span class="label">CSI:</span> 540</div>
</div>
</div>

<div class="section">
<h3>Operational Summary</h3>
<p><strong>Friday (Oct 24):</strong> Low fire danger. Fires do not ignite readily. Morning frost possible in low-lying areas.</p>
<p><strong>Saturday (Oct 25):</strong> Moderate fire danger develops. Occasional fire activity possible. Fires can start from most accidental causes. Prompt initial attack recommended.</p>
<p><strong>Sunday (Oct 26):</strong> Moderate fire danger continues. Fires remain controllable with prompt initial attack. Continue monitoring accidental ignitions.</p>
<p><strong>Overall:</strong> No Red Flag Warnings or Fire Weather Watches anticipated. Conditions remain stable.</p>
</div>

<div class="section">
<p style="text-align:center; color:#666; margin-top:30px;">
Issued: Thursday, October 23, 2025 | Valid: October 24-26, 2025<br>
Prepared by: Fire Weather Forecast Team | Virginia Department of Forestry<br>
Last Updated: {today.strftime('%B %d, %Y at %I:%M %p EDT')}
</p>
</div>
</body>
</html>
'''

with open('forecasts/current-forecast.html', 'w') as f:
    f.write(html)

print(f"✅ Forecast generated: forecasts/current-forecast.html")
print(f"📅 {today.strftime('%Y-%m-%d %H:%M:%S')}")
