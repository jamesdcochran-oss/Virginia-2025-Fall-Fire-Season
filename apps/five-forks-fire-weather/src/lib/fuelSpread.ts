/**
 * Fuel Spread Rate Calculations
 * 
 * This module implements simplified fire spread rate calculations for different fuel types.
 * The calculations are based on simplified Rothermel-style approximations and are intended
 * for demonstration and planning purposes, not for operational fire behavior prediction.
 * 
 * References:
 * - Rothermel, R.C. (1972). A mathematical model for predicting fire spread in wildland fuels.
 * - Anderson, H.E. (1982). Aids to determining fuel models for estimating fire behavior.
 * 
 * All calculations use SI units:
 * - Temperature: °C
 * - Wind speed: m/s
 * - Fuel moisture: %
 * - Slope: degrees
 * - Spread rate: m/s
 */

import { FuelSpreadParams, FuelSpreadResult } from '../types';

/**
 * Compute grass fuel spread rate
 * 
 * Grass fuels are fine, dry fuels with low thermal inertia and high surface-area-to-volume ratio.
 * They respond quickly to wind and slope but are highly sensitive to moisture content.
 * 
 * Simplified model coefficients (empirical):
 * - Base spread rate: 0.001 m/s (very slow creep with no wind)
 * - Wind coefficient: 0.08 (grass is highly wind-driven)
 * - Slope coefficient: 0.05 (slope effect is moderate)
 * - Moisture damping: exponential decay, critical moisture ~15%
 * - Temperature factor: minimal (already captured in moisture)
 * 
 * @param params - Fuel moisture (%), wind speed (m/s), temperature (°C), slope (degrees)
 * @returns Spread rate (m/s) and explanation
 */
export function computeGrassSpread(params: FuelSpreadParams): FuelSpreadResult {
  const { fuelMoisture, windSpeed, temperature, slope } = params;

  // Base spread rate (m/s) - very slow backing fire
  const baseRate = 0.001;

  // Wind factor: grass is highly responsive to wind
  const windFactor = 1 + 0.08 * windSpeed;

  // Slope factor: slope accelerates spread uphill (positive slope = uphill)
  const slopeFactor = 1 + 0.05 * Math.max(0, slope);

  // Moisture damping: exponential decay
  // Critical moisture for grass ~15%, extinction ~25%
  const moistureDamping = Math.exp(-fuelMoisture / 10);

  // Temperature has minimal direct effect (already captured by moisture)
  // but we can add a small adjustment for extreme heat
  const tempAdjustment = 1 + Math.max(0, (temperature - 30) / 100);

  const spreadRate = baseRate * windFactor * slopeFactor * moistureDamping * tempAdjustment;

  const explanation = 
    `Grass fuel spread: Base=${baseRate.toFixed(4)} m/s, ` +
    `Wind factor=${windFactor.toFixed(2)}, Slope factor=${slopeFactor.toFixed(2)}, ` +
    `Moisture damping=${moistureDamping.toFixed(2)}, Temp adj=${tempAdjustment.toFixed(2)}`;

  return { spreadRate, explanation };
}

/**
 * Compute timber litter spread rate
 * 
 * Timber litter consists of needles, leaves, and small twigs on the forest floor.
 * These fuels have moderate density and are less wind-driven than grass but more
 * responsive than large woody debris.
 * 
 * Simplified model coefficients (empirical):
 * - Base spread rate: 0.0005 m/s
 * - Wind coefficient: 0.04 (less responsive than grass)
 * - Slope coefficient: 0.04
 * - Moisture damping: critical moisture ~20%, extinction ~35%
 * 
 * @param params - Fuel moisture (%), wind speed (m/s), temperature (°C), slope (degrees)
 * @returns Spread rate (m/s) and explanation
 */
export function computeTimberLitterSpread(params: FuelSpreadParams): FuelSpreadResult {
  const { fuelMoisture, windSpeed, temperature, slope } = params;

  const baseRate = 0.0005;
  const windFactor = 1 + 0.04 * windSpeed;
  const slopeFactor = 1 + 0.04 * Math.max(0, slope);

  // Timber litter has higher critical moisture content than grass
  const moistureDamping = Math.exp(-fuelMoisture / 15);

  const tempAdjustment = 1 + Math.max(0, (temperature - 25) / 120);

  const spreadRate = baseRate * windFactor * slopeFactor * moistureDamping * tempAdjustment;

  const explanation =
    `Timber litter spread: Base=${baseRate.toFixed(4)} m/s, ` +
    `Wind factor=${windFactor.toFixed(2)}, Slope factor=${slopeFactor.toFixed(2)}, ` +
    `Moisture damping=${moistureDamping.toFixed(2)}, Temp adj=${tempAdjustment.toFixed(2)}`;

  return { spreadRate, explanation };
}

/**
 * Compute pine stand spread rate
 * 
 * Pine stands include both surface fuels (needles, cones) and potential for crown fire.
 * This simplified model focuses on surface spread but uses coefficients that account
 * for the denser fuel loading and vertical structure of pine forests.
 * 
 * Simplified model coefficients (empirical):
 * - Base spread rate: 0.0008 m/s
 * - Wind coefficient: 0.05 (moderate wind response)
 * - Slope coefficient: 0.06 (pine stands on slopes can spread rapidly)
 * - Moisture damping: critical moisture ~18%
 * - Note: This does NOT model crown fire transition, which requires additional criteria
 * 
 * @param params - Fuel moisture (%), wind speed (m/s), temperature (°C), slope (degrees)
 * @returns Spread rate (m/s) and explanation
 */
export function computePineStandSpread(params: FuelSpreadParams): FuelSpreadResult {
  const { fuelMoisture, windSpeed, temperature, slope } = params;

  const baseRate = 0.0008;
  const windFactor = 1 + 0.05 * windSpeed;
  const slopeFactor = 1 + 0.06 * Math.max(0, slope);

  // Pine needles have moderate critical moisture
  const moistureDamping = Math.exp(-fuelMoisture / 12);

  const tempAdjustment = 1 + Math.max(0, (temperature - 28) / 110);

  const spreadRate = baseRate * windFactor * slopeFactor * moistureDamping * tempAdjustment;

  const explanation =
    `Pine stand spread: Base=${baseRate.toFixed(4)} m/s, ` +
    `Wind factor=${windFactor.toFixed(2)}, Slope factor=${slopeFactor.toFixed(2)}, ` +
    `Moisture damping=${moistureDamping.toFixed(2)}, Temp adj=${tempAdjustment.toFixed(2)}. ` +
    `Note: Crown fire transition not modeled.`;

  return { spreadRate, explanation };
}
