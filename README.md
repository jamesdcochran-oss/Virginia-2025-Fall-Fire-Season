# Virginia 2025 Fall Fire Season — Five Forks Fire Weather

Live Dashboard
--------------
View the live dashboard:
https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season

What this project provides
- A lightweight fire weather dashboard for the Five Forks area.
- County-level cards and a Leaflet map.
- Fuel Moisture Calculator and a test suite.
- Automated brief generation scripts (in /scripts/ and /briefs/).

Quick start (local)
1. Clone the repo
   git clone https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season.git
2. Serve locally
   cd Virginia-2025-Fall-Fire-Season
   python -m http.server 8000
   Open http://localhost:8000 in your browser.

Fuel Moisture Calculator
- Accessible from the Fuel Calc button in index.html.
- Test suite is `fuel-calculator-test.html` (open directly to run the validation tests).

County data
- Counties are stored in `data/counties.json` and used across the dashboard and brief generator.
- This repo uses centroid "grid points" for each county. Update that JSON to change counties/locations.

Briefs
- Generated briefs are placed in `/briefs/`. Use `scripts/build_five_forks_brief.py` to generate DOCX briefs.
- A small index is available at `briefs/index.html` to provide stable links for "Latest Brief".

Diagnostics & troubleshooting
- diagnostics.html — browser checks for critical assets (computeEMC, counties.json, map).
- CONTRIBUTING.md — local pre-deploy checklist and quick checks.
- CI workflow runs a smoke test, validates required files, and executes `diagnostic_check.py`. See `.github/workflows/ci.yml`.

Contact / maintaining
- Update `data/counties.json` to keep the dashboard and brief generation in sync.
- For production/operational usage, refine centroid coordinates and consider adding FIPS IDs or polygons.

License
- [Your chosen license here]
