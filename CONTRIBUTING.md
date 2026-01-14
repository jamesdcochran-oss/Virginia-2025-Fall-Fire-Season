# Contributing & Pre-deploy Checklist

Please follow these steps before opening PRs that change runtime files (index.html, scripts, data):

Local smoke checks
1. Run the quick static server:
   python -m http.server 8000
   Then open http://localhost:8000/fuel-calculator-test.html and http://localhost:8000/index.html

2. Verify fuel-calculator:
   - Open fuel-calculator-test.html and confirm tests populate and computeEMC() exists.
   - Open the Fuel Calc modal on the main page and run a model.

3. Run diagnostics:
   - Open diagnostics.html and confirm computeEMC detected and data/counties.json loads.

4. Run Python diagnostics locally:
   pip install python-docx
   python diagnostic_check.py

CI expectations
- The repository includes a lightweight CI workflow (.github/workflows/ci.yml) which:
  - Verifies required files are present
  - Verifies computeEMC/stepMoisture/runModel exist in fuel-calculator.js
  - Runs diagnostic_check.py and uploads diag.log artifact

Adding/updating counties
- Edit `data/counties.json`. Keep the simple shape:
  [{ "name": "X", "lat": 37.0, "lon": -77.0 }, ...]
- The dashboard reads the JSON at runtime; after updating, open the dashboard and click Refresh.

Notes
- Filenames are case-sensitive on GitHub Pages — double-check capitalization when referencing files.
- For production-grade EMC, we can swap the empirical function here for the official NFDRS implementation and add test vectors.
