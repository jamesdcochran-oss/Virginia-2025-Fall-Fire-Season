import type { FuelSpreadInput, FuelSpreadResult } from '../types';

/**
 * Fuel Spread Rate Calculations
 * 
 * This module implements simplified Rothermel-like empirical formulas to estimate
 * fire spread rates for different fuel types. These are approximations based on
 * wildland fire behavior models.
 * 
 * References:
 * - Rothermel, R.C. (1972). A mathematical model for predicting fire spread in wildland fuels.
 * - Andrews, P.L. (2018). The Rothermel surface fire spread model and associated developments.
 * 
 * Note: These are simplified approximations for demonstration purposes.
 * For production use, consider using validated fire behavior models.
 */

/**
 * Compute fire spread rate in grass fuels
 * 
 * Grass fuels are fine, flashy fuels with rapid drying and high spread potential.
 * Spread is highly influenced by wind and fuel moisture.
 * 
 * @param params - Fuel and weather conditions
 * @returns Estimated spread rate and explanation
 */
export function computeGrassSpread(params: FuelSpreadInput): FuelSpreadResult {
  const { fuelMoisture, windSpeed, temperature, slope } = params;
  
  // Default coefficients for grass fuels (calibrated for common grasslands)
  const baseRate = 0.05; // m/s base spread rate
  const windFactor = 0.15; // wind influence coefficient
  const moistureFactor = 0.02; // moisture damping coefficient
  const slopeFactor = 0.01; // slope influence coefficient
  const tempFactor = 0.002; // temperature enhancement coefficient
  
  // Moisture damping: higher moisture reduces spread
  const moistureDamping = Math.max(0.1, 1 - (fuelMoisture * moistureFactor));
  
  // Wind enhancement: exponential relationship
  const windEnhancement = 1 + (windSpeed * windFactor);
  
  // Slope enhancement: fires spread faster upslope
  const slopeEnhancement = 1 + (Math.max(0, slope) * slopeFactor);
  
  // Temperature enhancement: higher temps increase spread slightly
  const tempEnhancement = 1 + (Math.max(0, temperature - 20) * tempFactor);
  
  // Combined spread rate
  const spreadRate = baseRate * moistureDamping * windEnhancement * slopeEnhancement * tempEnhancement;
  
  const explanation = `Grass spread: ${spreadRate.toFixed(4)} m/s. ` +
    `Moisture damping: ${(moistureDamping * 100).toFixed(1)}%, ` +
    `wind enhancement: ${windEnhancement.toFixed(2)}x, ` +
    `slope factor: ${slopeEnhancement.toFixed(2)}x, ` +
    `temp factor: ${tempEnhancement.toFixed(2)}x.`;
  
  return {
    spreadRate: Number(spreadRate.toFixed(6)),
    explanation,
  };
}

/**
 * Compute fire spread rate in timber litter fuels
 * 
 * Timber litter consists of needles, leaves, and small twigs under forest canopy.
 * Slower to dry than grass, moderate spread potential.
 * 
 * @param params - Fuel and weather conditions
 * @returns Estimated spread rate and explanation
 */
export function computeTimberLitterSpread(params: FuelSpreadInput): FuelSpreadResult {
  const { fuelMoisture, windSpeed, temperature, slope } = params;
  
  // Default coefficients for timber litter (calibrated for conifer litter)
  const baseRate = 0.03; // m/s base spread rate (slower than grass)
  const windFactor = 0.08; // reduced wind influence under canopy
  const moistureFactor = 0.025; // more sensitive to moisture
  const slopeFactor = 0.015; // stronger slope effect in forest
  const tempFactor = 0.0015; // moderate temperature effect
  
  // Moisture damping: timber litter holds moisture longer
  const moistureDamping = Math.max(0.05, 1 - (fuelMoisture * moistureFactor));
  
  // Wind enhancement: reduced by canopy
  const windEnhancement = 1 + (windSpeed * windFactor);
  
  // Slope enhancement
  const slopeEnhancement = 1 + (Math.max(0, slope) * slopeFactor);
  
  // Temperature enhancement
  const tempEnhancement = 1 + (Math.max(0, temperature - 15) * tempFactor);
  
  // Combined spread rate
  const spreadRate = baseRate * moistureDamping * windEnhancement * slopeEnhancement * tempEnhancement;
  
  const explanation = `Timber litter spread: ${spreadRate.toFixed(4)} m/s. ` +
    `Moisture damping: ${(moistureDamping * 100).toFixed(1)}%, ` +
    `wind enhancement: ${windEnhancement.toFixed(2)}x, ` +
    `slope factor: ${slopeEnhancement.toFixed(2)}x, ` +
    `temp factor: ${tempEnhancement.toFixed(2)}x.`;
  
  return {
    spreadRate: Number(spreadRate.toFixed(6)),
    explanation,
  };
}

/**
 * Compute fire spread rate in pine stand fuels
 * 
 * Pine stands include surface fuels plus ladder fuels that can carry fire into canopy.
 * Moderate spread rate but high potential for crown fire under extreme conditions.
 * 
 * @param params - Fuel and weather conditions
 * @returns Estimated spread rate and explanation
 */
export function computePineStandSpread(params: FuelSpreadInput): FuelSpreadResult {
  const { fuelMoisture, windSpeed, temperature, slope } = params;
  
  // Default coefficients for pine stand fuels
  const baseRate = 0.04; // m/s base spread rate
  const windFactor = 0.12; // moderate wind influence
  const moistureFactor = 0.022; // moderate moisture sensitivity
  const slopeFactor = 0.02; // significant slope effect
  const tempFactor = 0.0018; // moderate temperature effect
  const crownFireThreshold = 8.0; // m/s wind speed for potential crown fire
  
  // Moisture damping
  const moistureDamping = Math.max(0.08, 1 - (fuelMoisture * moistureFactor));
  
  // Wind enhancement with crown fire potential
  let windEnhancement = 1 + (windSpeed * windFactor);
  const crownFirePotential = windSpeed >= crownFireThreshold;
  if (crownFirePotential) {
    // Exponential increase in spread rate for crown fire potential
    windEnhancement *= 1.5;
  }
  
  // Slope enhancement
  const slopeEnhancement = 1 + (Math.max(0, slope) * slopeFactor);
  
  // Temperature enhancement
  const tempEnhancement = 1 + (Math.max(0, temperature - 18) * tempFactor);
  
  // Combined spread rate
  const spreadRate = baseRate * moistureDamping * windEnhancement * slopeEnhancement * tempEnhancement;
  
  let explanation = `Pine stand spread: ${spreadRate.toFixed(4)} m/s. ` +
    `Moisture damping: ${(moistureDamping * 100).toFixed(1)}%, ` +
    `wind enhancement: ${windEnhancement.toFixed(2)}x, ` +
    `slope factor: ${slopeEnhancement.toFixed(2)}x, ` +
    `temp factor: ${tempEnhancement.toFixed(2)}x.`;
  
  if (crownFirePotential) {
    explanation += ` WARNING: Wind speed (${windSpeed.toFixed(1)} m/s) exceeds crown fire threshold - active crown fire possible.`;
  }
  
  return {
    spreadRate: Number(spreadRate.toFixed(6)),
    explanation,
  };
}
