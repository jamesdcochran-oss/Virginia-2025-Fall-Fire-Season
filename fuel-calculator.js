/* fuel-calculator.js
   Minimal, robust fuel moisture calculator used by index.html and fuel-calculator-test.html
   - computeEMC(tempF, rh): empirical approximation used in many fire-weather tools
   - stepMoisture(initial, emc, hours, timeLag): exponential time-lag model
   - runModel(...) + DOM wiring to populate forecast rows and run the model
   Defensive: only runs UI wiring when expected elements exist.
*/

(function(global){
  'use strict';

  // Constants
  const MIN_TIME_LAG = 0.0001; // Minimum time lag to prevent division by zero
  const CRITICAL_MOISTURE_THRESHOLD = 6; // 1-hour fuel moisture threshold (%)
  
  // Default values for fallbacks
  const DEFAULT_TEMP = 70; // Default temperature (°F)
  const DEFAULT_RH = 50; // Default relative humidity (%)
  const DEFAULT_WIND = 5; // Default wind speed (mph)
  const DEFAULT_HOURS = 12; // Default drying hours
  const DEFAULT_INITIAL_1HR = 8; // Default 1-hour fuel moisture (%)
  const DEFAULT_INITIAL_10HR = 10; // Default 10-hour fuel moisture (%)
  
  // Default values for forecast table generation
  const FORECAST_BASE_TEMP = 60; // Base temperature for forecast table (°F)
  const FORECAST_BASE_RH = 60; // Base RH for forecast table (%)
  const FORECAST_BASE_WIND = 5; // Base wind for forecast table (mph)

  // Helper: robustly parse a numeric input (strings from inputs, etc.)
  // If parsing fails, return the fallback (which must be a finite number).
  function safeParse(value, fallback) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }

  // Compute Equilibrium Moisture Content (EMC) %
  // Empirical approximation (commonly used form)
  function computeEMC(tempF, rh) {
    // sensible defaults: 70°F and 50% rh when inputs are invalid
    const T = safeParse(tempF, DEFAULT_TEMP);
    let RH = safeParse(rh, DEFAULT_RH);
    RH = Math.max(0, Math.min(100, RH)); // clamp 0..100

    // Empirical approximation (common form used in many tools)
    const emc = 0.942 * Math.pow(RH, 0.679) +
                11 * Math.exp((RH - 100) / 10) +
                0.18 * (21.1 - T) * (1 - Math.exp(-0.115 * RH));

    // Keep one decimal and a sensible minimum (0.1%) to avoid zero/negative artifacts
    return Math.max(0.1, Number(emc.toFixed(1)));
  }

  // Time-lag drying/wetting model:
  // m_t = EMC + (m0 - EMC) * exp(-hours / timeLag)
  function stepMoisture(initial, emc, hours, timeLag) {
    const m0 = safeParse(initial, emc); // if initial invalid, assume starting at emc
    const e = safeParse(emc, 5); // fallback emc if invalid (shouldn't happen)
    const h = safeParse(hours, 0);
    // protect against zero/negative timeLag by ensuring a very small positive value
    const lag = Math.max(MIN_TIME_LAG, safeParse(timeLag, 1));
    const k = Math.exp(-h / lag);
    return Number((e + (m0 - e) * k).toFixed(1));
  }

  // Run model over forecast days (forecastEntries: [{temp, rh, wind, hours}])
  function runModel(initial1hr, initial10hr, forecastEntries) {
    const i1 = safeParse(initial1hr, DEFAULT_INITIAL_1HR);
    const i10 = safeParse(initial10hr, DEFAULT_INITIAL_10HR);

    const results = {
      initial1hr: i1,
      initial10hr: i10,
      dailyResults: [],
      summary: {}
    };

    let prev1 = i1;
    let prev10 = i10;

    const entries = Array.isArray(forecastEntries) ? forecastEntries : [];

    entries.forEach((day, i) => {
      // defensive per-day parsing with sensible defaults
      const temp = safeParse(day.temp, DEFAULT_TEMP);
      const rh = safeParse(day.rh, DEFAULT_RH);
      const wind = safeParse(day.wind, 0);
      const hours = Math.max(0, safeParse(day.hours, DEFAULT_HOURS));

      const emc = computeEMC(temp, rh);

      const m1 = stepMoisture(prev1, emc, hours, 1);
      const m10 = stepMoisture(prev10, emc, hours, 10);

      results.dailyResults.push({
        day: day.label || (`Day ${i+1}`),
        temp: temp,
        rh: rh,
        wind: wind,
        hours: hours,
        moisture1Hr: m1,
        moisture10Hr: m10
      });

      prev1 = m1;
      prev10 = m10;
    });

    const critIndex = results.dailyResults.findIndex(r => Number.isFinite(r.moisture1Hr) && r.moisture1Hr <= CRITICAL_MOISTURE_THRESHOLD);
    results.summary.firstCritical1HrDay = critIndex >= 0 ? results.dailyResults[critIndex].day : null;

    // also expose final values for convenience
    results.summary.final1Hr = results.dailyResults.length ? results.dailyResults[results.dailyResults.length - 1].moisture1Hr : prev1;
    results.summary.final10Hr = results.dailyResults.length ? results.dailyResults[results.dailyResults.length - 1].moisture10Hr : prev10;

    return results;
  }

  /* UI helpers: these will run only if the page contains the expected elements.
     Keeps the file safe to include everywhere.
  */
  function populateDefaultForecastTable(rows = 5) {
    const tbody = document.getElementById('forecastDays');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (let i = 0; i < rows; i++) {
      const tempVal = FORECAST_BASE_TEMP + i;
      const rhVal = FORECAST_BASE_RH - i * 5;
      const windVal = FORECAST_BASE_WIND + i;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>Day ${i+1}</td>
        <td><input type="number" class="fc-temp" value="${tempVal}" step="1" min="-20" max="130"></td>
        <td><input type="number" class="fc-rh" value="${rhVal}" step="1" min="0" max="100"></td>
        <td><input type="number" class="fc-wind" value="${windVal}" step="1" min="0" max="100"></td>
        <td><input type="number" class="fc-hours" value="${DEFAULT_HOURS}" step="1" min="0" max="24"></td>
      `;
      tbody.appendChild(tr);
    }
  }

  function readForecastTable() {
    const tbody = document.getElementById('forecastDays');
    if (!tbody) return [];
    const rows = Array.from(tbody.querySelectorAll('tr'));
    return rows.map((tr, idx) => {
      // use safeParse to allow 0 values and avoid mistaken defaults
      const tempInput = tr.querySelector('.fc-temp')?.value ?? '';
      const rhInput = tr.querySelector('.fc-rh')?.value ?? '';
      const windInput = tr.querySelector('.fc-wind')?.value ?? '';
      const hoursInput = tr.querySelector('.fc-hours')?.value ?? '';

      const temp = safeParse(tempInput, DEFAULT_TEMP);
      const rh = safeParse(rhInput, DEFAULT_RH);
      const wind = safeParse(windInput, DEFAULT_WIND);
      const hours = Math.max(0, safeParse(hoursInput, DEFAULT_HOURS));

      return { label: `Day ${idx+1}`, temp, rh, wind, hours };
    });
  }

  function showResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsTable = document.getElementById('resultsTable');
    const warningMessage = document.getElementById('warningMessage');
    if (!resultsSection || !resultsTable) return;

    resultsSection.style.display = 'block';
    let html = '<table><thead><tr><th>Day</th><th>Temp°F</th><th>Min RH%</th><th>1-hr%</th><th>10-hr%</th></tr></thead><tbody>';
    results.dailyResults.forEach(r => {
      html += `<tr>
        <td>${r.day}</td><td>${r.temp}</td><td>${r.rh}</td>
        <td>${r.moisture1Hr}%</td><td>${r.moisture10Hr}%</td>
      </tr>`;
    });
    html += '</tbody></table>';
    resultsTable.innerHTML = html;

    if (warningMessage) {
      if (results.summary.firstCritical1HrDay) {
        warningMessage.style.display = 'block';
        warningMessage.textContent = `⚠️ Critical drying detected first on ${results.summary.firstCritical1HrDay}`;
      } else {
        warningMessage.style.display = 'none';
        warningMessage.textContent = '';
      }
    }
  }

  function wireUI() {
    populateDefaultForecastTable(5);

    const runBtn = document.getElementById('runModelBtn');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        // use safeParse so a value of "0" is preserved and empty/invalid become defaults
        const initial1Input = document.getElementById('initial1hr')?.value ?? '';
        const initial10Input = document.getElementById('initial10hr')?.value ?? '';
        const initial1 = safeParse(initial1Input, DEFAULT_INITIAL_1HR);
        const initial10 = safeParse(initial10Input, DEFAULT_INITIAL_10HR);

        const forecast = readForecastTable();
        try {
          const results = runModel(initial1, initial10, forecast);
          showResults(results);
          console.log('Fuel model results:', results);
        } catch (err) {
          console.error('Fuel model error', err);
        }
      });
    }

    const modalClose = document.getElementById('modalCloseBtn');
    if (modalClose) modalClose.addEventListener('click', () => {
      const modal = document.getElementById('fuelCalcModal');
      if (modal) modal.style.display = 'none';
    });
  }

  // Expose API for tests/pages
  global.computeEMC = computeEMC;
  global.stepMoisture = stepMoisture;
  global.runModel = runModel;

  // On DOM ready, wire UI (safe-guarded)
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wireUI);
    } else {
      wireUI();
    }
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : {}));
