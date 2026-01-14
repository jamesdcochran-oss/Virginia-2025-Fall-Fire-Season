# Virginia 2025 Fall Fire Season — Five Forks Fire Weather

Live site
- https://jamesdcochran-oss.github.io/Virginia-2025-Fall-Fire-Season/

Purpose
- Static dashboard for Five Forks fire weather: county cards, map, fuel moisture calculator, brief generation helpers, diagnostics.

Required files and expected locations
- index.html
- style.css
- dashboard.js (root) or scripts/dashboard.js (ensure path matches index.html)
- fuel-calculator.js
- data/counties.json
- briefs/index.html
- diagnostics.html
- fuel-calculator-test.html (test page)
- diagnostic_check.py (optional Python diagnostics)
- .github/workflows/ci.yml (CI smoke checks)

Quick start (local)
1. Clone repo:
   git clone https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season.git
2. Serve:
   cd Virginia-2025-Fall-Fire-Season
   python -m http.server 8000
3. Open:
   http://localhost:8000

Fuel Moisture Calculator
- Test page: `fuel-calculator-test.html`
- Exports required on window: `computeEMC`, `stepMoisture`, `runModel`
- Modal uses: `#forecastDays` table, `#initial1hr`, `#initial10hr`, `#runModelBtn`, `#resultsTable`, `#resultsSection`, `#warningMessage`

County data
- Canonical file: `data/counties.json`
- Object shape:
  [
    { "name": "Amelia", "lat": 37.328, "lon": -77.99 },
    ...
  ]
- This file is used by dashboard, brief generator, and diagnostics.
- Centroids are approximate. Add a follow-up issue if precise centroids or FIPS are required.

Brief generation
- Brief generator script: `scripts/build_five_forks_brief.py`
- Output folder: `/briefs/`
- To regenerate briefs: install `python-docx` and run the script per its header docs.

Diagnostics
- Browser diagnostics: `diagnostics.html` (checks `computeEMC`, fetch `data/counties.json`, presence of `#map`)
- Python diagnostics: `python diagnostic_check.py` (requires `python-docx` for full checks)
- Local run:
  pip install python-docx
  python diagnostic_check.py

CI (GitHub Actions)
- Workflow: `.github/workflows/ci.yml`
- Checks:
  - required files present (index.html, dashboard.js, fuel-calculator.js, data/counties.json)
  - presence of `computeEMC`/`stepMoisture`/`runModel` in `fuel-calculator.js`
  - runs `diagnostic_check.py` and uploads `diag.log`
- To run locally: run the same checks manually and run `python diagnostic_check.py`.

Deployment (GitHub Pages)
- Ensure Pages source is set to the branch/folder you publish from (usually `main` / `docs` or root).
- Filenames are case-sensitive on Pages. Verify capitalization of every `href`/`src`.
- After merging PR to the Pages branch, allow a few minutes for Pages to publish.

Verification checklist (post-merge)
1. Open live URL, confirm no console errors about missing functions or files.
2. Open Fuel Calc modal and run model; results populate and show warnings if critical drying.
3. Open `fuel-calculator-test.html` and confirm tests run and output visible.
4. Confirm county cards populate from `data/counties.json`; simulate fetch failure to validate fallback messaging and retry.
5. Confirm map tiles load; test fallback by blocking primary tiles and checking OpenStreetMap fallback.
6. Open `briefs/index.html`, confirm briefs or instructions visible.
7. Open `diagnostics.html` on live site to check assets.

Troubleshooting quick hits
- Page unstyled: check `style.css` path and network for 404.
- Missing JS: check console for 404s for `fuel-calculator.js` or `dashboard.js`.
- computeEMC undefined: ensure `fuel-calculator.js` is loaded and exposes functions on `window`.
- County JSON 404: path or case mismatch; confirm `data/counties.json`.
- Tile failures: check tile URL, CORS, and provider rate limits; use tile fallback in `dashboard.js`.

Contributing & pre-deploy checklist
- Run local static server and test:
  python -m http.server 8000
  Open `fuel-calculator-test.html`, `index.html`, `diagnostics.html`.
- Run Python diagnostic:
  pip install python-docx
  python diagnostic_check.py
- CI will run smoke checks; fix console errors before merging.
- Update `data/counties.json` for location changes.
- Keep filenames exact (case-sensitive).

Contact / maintainers
- Repo owner: jamesdcochran-oss
- Open an issue with reproduction steps and browser console output for help.

License
- Add license text here.
