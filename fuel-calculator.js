// Fuel Moisture Calculator - Core Calculation Engine
// Fine dead fuel drying model with EMC and time-lag classes
// Based on NFDRS (National Fire Danger Rating System) methodology

/**
 * Equilibrium Moisture Content (EMC) Calculation
 * Piecewise function used in fire behavior modeling
 * Based on Nelson (2000) and NFDRS standards
 * 
 * @param {number} tempF - Temperature in Fahrenheit
 * @param {number} rh - Relative humidity percentage (0-100)
 * @returns {number} EMC percentage
 */
function computeEMC(tempF, rh) {
  const T = tempF;
  const H = Math.min(100, Math.max(0, rh)); // Clamp RH to 0-100%
  
  let emc;
  
  // Piecewise EMC function based on RH ranges
  if (H < 10) {
    emc = 0.03229 + 0.281073 * H - 0.000578 * H * T;
  } else if (H < 50) {
    emc = 2.22749 + 0.160107 * H - 0.014784 * T;
  } else {
    emc = 21.0606 + 0.005565 * H * H - 0.00035 * H * T;
  }
  
  // Clamp to reasonable fuel moisture range
  return Math.min(60, Math.max(0, emc));
}

/**
 * Time-lag fuel moisture drying/wetting model
 * Uses exponential decay toward EMC
 * Formula: m(t) = EMC + (m₀ - EMC) × e^(-t/τ)
 * 
 * @param {number} currentMoisture - Current fuel moisture %
 * @param {number} emc - Equilibrium moisture content %
 * @param {number} hours - Time period in hours
 * @param {number} timelagHours - Fuel timelag constant (1 for 1-hr fuels, 10 for 10-hr)
 * @returns {number} New fuel moisture %
 */
function stepMoisture(currentMoisture, emc, hours, timelagHours) {
  const dt = Math.max(0, hours);
  const k = Math.exp(-dt / timelagHours);
  return emc + (currentMoisture - emc) * k;
}

/**
 * Calculate effective drying hours per day
 * Accounts for wind and humidity effects on drying rate
 * 
 * @param {number} rh - Relative humidity %
 * @param {number} wind - Wind speed in mph
 * @returns {number} Effective drying hours
 */
function effectiveDryingHours(rh, wind) {
  // Base 6 hours of effective drying per day
  let hours = 6;
  
  // Wind increases drying rate
  hours += (wind || 0) / 4; // Every 4 mph wind adds ~1 hour
  
  // High humidity reduces drying
  if (rh > 60) hours -= 2;
  if (rh > 80) hours -= 2; // Very humid conditions
  
  // Clamp to reasonable range (1-14 hours per day)
  return Math.min(14, Math.max(1, hours));
}

/**
 * Run multi-day fuel moisture forecast
 * 
 * @param {Object} config - Configuration object
 * @param {number} config.initial1Hr - Starting 1-hour fuel moisture %
 * @param {number} config.initial10Hr - Starting 10-hour fuel moisture %
 * @param {Array} config.forecast - Array of forecast day objects
 * @returns {Object} Results with daily progression and summary
 */
function runFuelMoistureModel(config) {
  const { initial1Hr, initial10Hr, forecast } = config;
  
  let m1 = Number(initial1Hr) || 0;
  let m10 = Number(initial10Hr) || 0;
  
  const dailyResults = [];
  let firstCritical1Hr = null;
  let firstCritical10Hr = null;
  
  forecast.forEach((day, index) => {
    const temp = Number(day.temp) || 0;
    const rh = Number(day.rh) || 0;
    const wind = Number(day.wind) || 0;
    
    // Calculate EMC for current conditions
    const emc = computeEMC(temp, rh);
    
    // Effective drying hours
    const hours = effectiveDryingHours(rh, wind);
    
    // Drying delay: Sharp RH drops cause temporary lag in drying
    let delay = 0;
    if (index > 0) {
      const prevRh = Number(forecast[index - 1].rh) || rh;
      if (prevRh > 70 && rh < 40) {
        delay = 1; // 1 hour delay when conditions change rapidly
      }
    }
    
    const netHours = Math.max(0, hours - delay);
    
    // Update fuel moisture for both timelag classes
    const newM1 = stepMoisture(m1, emc, netHours, 1);   // 1-hour fuels
    const newM10 = stepMoisture(m10, emc, netHours, 10); // 10-hour fuels
    
    m1 = newM1;
    m10 = newM10;
    
    // Track first day fuels become critically dry
    if (firstCritical1Hr === null && m1 <= 6) {
      firstCritical1Hr = day.label || `Day ${index + 1}`;
    }
    if (firstCritical10Hr === null && m10 <= 8) {
      firstCritical10Hr = day.label || `Day ${index + 1}`;
    }
    
    // Store daily results
    dailyResults.push({
      label: day.label || `Day ${index + 1}`,
      temp,
      rh,
      wind,
      emc: Number(emc.toFixed(1)),
      effectiveHours: Number(hours.toFixed(1)),
      delay,
      moisture1Hr: Number(newM1.toFixed(1)),
      moisture10Hr: Number(newM10.toFixed(1)),
      // Flag critical conditions
      is1HrCritical: newM1 <= 6,
      is10HrCritical: newM10 <= 8
    });
  });
  
  return {
    dailyResults,
    summary: {
      final1Hr: Number(m1.toFixed(1)),
      final10Hr: Number(m10.toFixed(1)),
      firstCritical1HrDay: firstCritical1Hr,
      firstCritical10HrDay: firstCritical10Hr
    }
  };
}

/**
 * Estimate initial fuel moisture from current weather conditions
 * Used when actual fuel moisture measurements aren't available
 * 
 * @param {number} currentRH - Current relative humidity %
 * @param {number} currentTemp - Current temperature F
 * @returns {Object} Estimated fuel moistures
 */
function estimateInitialMoisture(currentRH, currentTemp) {
  // Use EMC as baseline estimate
  const baseEMC = computeEMC(currentTemp, currentRH);
  
  // 1-hr fuels equilibrate quickly, close to EMC
  const est1Hr = Math.max(5, baseEMC + 2);
  
  // 10-hr fuels lag behind, typically 3-5% higher
  const est10Hr = Math.max(8, baseEMC + 5);
  
  return {
    initial1Hr: Number(est1Hr.toFixed(1)),
    initial10Hr: Number(est10Hr.toFixed(1))
  };
}

// Export functions for use in main dashboard
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment (for testing)
  module.exports = {
    computeEMC,
    stepMoisture,
    effectiveDryingHours,
    runFuelMoistureModel,
    estimateInitialMoisture
  };
}
