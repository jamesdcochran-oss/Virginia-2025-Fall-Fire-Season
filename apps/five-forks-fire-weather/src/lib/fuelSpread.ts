/**
 * Fuel spread rate calculations
 * Implements simplified Rothermel-like approximations for different fuel types
 * 
 * References:
 * - Rothermel, R.C. 1972. A mathematical model for predicting fire spread in wildland fuels.
 * - Anderson, H.E. 1983. Predicting wind-driven wild land fire size and shape.
 * 
 * NOTE: These are simplified empirical approximations for demonstration purposes.
 * Production fire modeling should use validated models like FARSITE, FlamMap, or BehavePlus.
 */

import { FuelSpreadParams, FuelSpreadResult } from '../types';

/**
 * Compute grass fuel spread rate
 * Based on simplified Rothermel model for grass fuels (Fuel Model 1-3)
 * 
 * @param params Fuel and weather parameters
 * @returns Spread rate in m/s and explanation
 */
export function computeGrassSpread(params: FuelSpreadParams): FuelSpreadResult {
  const { fuelMoisture, windSpeed, temperature, slope } = params;

  // Coefficient defaults for grass fuels
  const baseSpreadRate = 0.05; // Base spread rate m/s at no wind, flat terrain
  const windCoefficient = 0.3; // Wind effect multiplier
  const slopeCoefficient = 0.1; // Slope effect multiplier
  const moistureCoefficient = 0.01; // Moisture dampening factor
  
  // Moisture dampening: higher moisture = slower spread
  // Typical grass extinction moisture: ~12-15%
  const moistureFactor = Math.max(0, 1 - (fuelMoisture * moistureCoefficient));
  
  // Wind effect: exponential relationship with wind speed
  const windFactor = 1 + (windCoefficient * windSpeed);
  
  // Slope effect: increases spread upslope
  const slopeFactor = 1 + (slopeCoefficient * Math.max(0, slope) / 10);
  
  // Temperature effect: slightly increases spread at higher temps
  const tempFactor = 1 + ((temperature - 20) * 0.01);
  
  // Combined spread rate
  const spreadRate = baseSpreadRate * moistureFactor * windFactor * slopeFactor * tempFactor;
  
  const explanation = `Grass spread: ${spreadRate.toFixed(4)} m/s. ` +
    `Moisture dampening: ${(moistureFactor * 100).toFixed(1)}%, ` +
    `Wind factor: ${windFactor.toFixed(2)}x, ` +
    `Slope factor: ${slopeFactor.toFixed(2)}x, ` +
    `Temp factor: ${tempFactor.toFixed(2)}x`;

  return { spreadRate, explanation };
}

/**
 * Compute timber litter fuel spread rate
 * Based on simplified Rothermel model for timber litter (Fuel Model 8-10)
 * 
 * @param params Fuel and weather parameters
 * @returns Spread rate in m/s and explanation
 */
export function computeTimberLitterSpread(params: FuelSpreadParams): FuelSpreadResult {
  const { fuelMoisture, windSpeed, temperature, slope } = params;

  // Coefficient defaults for timber litter
  const baseSpreadRate = 0.02; // Lower base spread than grass
  const windCoefficient = 0.15; // Less wind-driven than grass
  const slopeCoefficient = 0.15; // More slope-sensitive
  const moistureCoefficient = 0.015; // More moisture-sensitive
  
  // Moisture dampening: timber litter extinction ~20-25%
  const moistureFactor = Math.max(0, 1 - (fuelMoisture * moistureCoefficient));
  
  // Wind effect: less pronounced under canopy
  const windFactor = 1 + (windCoefficient * windSpeed);
  
  // Slope effect
  const slopeFactor = 1 + (slopeCoefficient * Math.max(0, slope) / 10);
  
  // Temperature effect
  const tempFactor = 1 + ((temperature - 20) * 0.008);
  
  // Combined spread rate
  const spreadRate = baseSpreadRate * moistureFactor * windFactor * slopeFactor * tempFactor;
  
  const explanation = `Timber litter spread: ${spreadRate.toFixed(4)} m/s. ` +
    `Moisture dampening: ${(moistureFactor * 100).toFixed(1)}%, ` +
    `Wind factor: ${windFactor.toFixed(2)}x, ` +
    `Slope factor: ${slopeFactor.toFixed(2)}x, ` +
    `Temp factor: ${tempFactor.toFixed(2)}x`;

  return { spreadRate, explanation };
}

/**
 * Compute pine stand fuel spread rate
 * Based on simplified Rothermel model for pine stands (Fuel Model 9-10)
 * Accounts for crown fire potential
 * 
 * @param params Fuel and weather parameters
 * @returns Spread rate in m/s and explanation
 */
export function computePineStandSpread(params: FuelSpreadParams): FuelSpreadResult {
  const { fuelMoisture, windSpeed, temperature, slope } = params;

  // Coefficient defaults for pine stands
  const baseSpreadRate = 0.03;
  const windCoefficient = 0.25; // Moderate wind sensitivity
  const slopeCoefficient = 0.12;
  const moistureCoefficient = 0.012;
  const crownFireThreshold = 5.0; // Wind speed m/s where crown fire becomes likely
  
  // Moisture dampening
  const moistureFactor = Math.max(0, 1 - (fuelMoisture * moistureCoefficient));
  
  // Wind effect with crown fire potential
  let windFactor = 1 + (windCoefficient * windSpeed);
  if (windSpeed > crownFireThreshold && fuelMoisture < 15) {
    // Crown fire multiplier when conditions are favorable
    windFactor *= 1.5;
  }
  
  // Slope effect
  const slopeFactor = 1 + (slopeCoefficient * Math.max(0, slope) / 10);
  
  // Temperature effect
  const tempFactor = 1 + ((temperature - 20) * 0.01);
  
  // Combined spread rate
  const spreadRate = baseSpreadRate * moistureFactor * windFactor * slopeFactor * tempFactor;
  
  const crownFireNote = (windSpeed > crownFireThreshold && fuelMoisture < 15) 
    ? ' (Crown fire potential!)' 
    : '';
  
  const explanation = `Pine stand spread: ${spreadRate.toFixed(4)} m/s. ` +
    `Moisture dampening: ${(moistureFactor * 100).toFixed(1)}%, ` +
    `Wind factor: ${windFactor.toFixed(2)}x, ` +
    `Slope factor: ${slopeFactor.toFixed(2)}x, ` +
    `Temp factor: ${tempFactor.toFixed(2)}x${crownFireNote}`;

  return { spreadRate, explanation };
}
