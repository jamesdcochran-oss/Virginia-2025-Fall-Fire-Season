// scripts/forecast.js
// Builds a forecast grid summarizing DOF and Local class with weather params

(async function() {
  const grid = document.getElementById('forecastGrid');
  const lastUpdateEl = document.getElementById('forecastLastUpdate');
  if (!grid) return;

  // Example static list of counties used on dashboard (match your dashboard set)
  const counties = [
    'Amelia County', 'Brunswick County', 'Dinwiddie County',
    'Greensville County', 'Nottoway County', 'Prince George County'
  ];

  // Helper to fetch weather and compute classes
  async function getCountyData(county) {
    // Placeholder demo data – replace with real DOF API and local logic as available
    // You can load from forecasts/ JSON files in repo, or call NWS gridpoints if desired
    const rnd = Math.random();
    const temp = Math.round(65 + rnd * 12); // F
    const rh = Math.round(35 + rnd * 30);   // %
    const wind = Math.round(4 + rnd * 10);  // mph
    const rain = +(rnd * 0.3).toFixed(2);   // in

    // Example class logic
    const classFrom = (src) => {
      if (rain > 0.1) return 'Low';
      if (wind >= 12 || (temp >= 75 && rh <= 40)) return src === 'DOF' ? 'Moderate' : 'High';
      if (temp >= 70 && rh <= 45) return 'Moderate';
      return 'Low';
    };

    return {
      county,
      dofClass: classFrom('DOF'),
      localClass: classFrom('LOCAL'),
      temp, rh, wind, rain
    };
  }

  async function buildGrid() {
    const rows = await Promise.all(counties.map(getCountyData));

    // Build header row
    const headers = ['County', 'Source', 'Class Day', 'Temp (°F)', 'RH (%)', 'Wind (mph)', 'Rain (in)'];
    headers.forEach(h => {
      const c = document.createElement('div');
      c.className = 'head';
      c.textContent = h;
      grid.appendChild(c);
    });

    // Build rows: for each county, two lines (DOF and LOCAL)
    rows.forEach(row => {
      const makeRow = (source, classVal) => {
        const classCss = classVal === 'High' ? 'class-high' : classVal === 'Moderate' ? 'class-mod' : 'class-low';
        const cells = [
          { text: row.county, cls: 'row-county src' },
          { text: source, cls: 'src' },
          { text: classVal, cls: classCss },
          { text: row.temp.toString() },
          { text: row.rh.toString() },
          { text: row.wind.toString() },
          { text: row.rain.toFixed(2) }
        ];
        cells.forEach((cell, idx) => {
          const d = document.createElement('div');
          d.className = 'cell ' + (cell.cls || '');
          d.textContent = cell.text;
          grid.appendChild(d);
        });
      };
      makeRow('DOF', row.dofClass);
      makeRow('Local', row.localClass);
    });

    if (lastUpdateEl) {
      lastUpdateEl.textContent = new Date().toLocaleString();
    }
  }

  // Initialize
  grid.innerHTML = '';
  await buildGrid();
})();
