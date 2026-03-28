/**
 * Weather utility functions
 * 
 * This module provides helper functions for weather-related calculations,
 * including dew point computation and unit conversions.
 */

/**
 * Compute dew point using the Magnus-Tetens formula
 * 
 * The Magnus-Tetens formula is a widely-used approximation for calculating
 * dew point temperature from air temperature and relative humidity.
 * 
 * Formula:
 *   α = ln(RH/100) + (b * T) / (c + T)
 *   Td = (c * α) / (b - α)
 * 
 * Where:
 *   - T is temperature in °C
 *   - RH is relative humidity in %
 *   - b = 17.27
 *   - c = 237.7 °C
 *   - Td is dew point in °C
 * 
 * Reference: Magnus, G. (1844), Versuche über die Spannkräfte des Wasserdampfs
 * 
 * @param tempC - Temperature in Celsius
 * @param rh - Relative humidity as percentage (0-100)
 * @returns Dew point temperature in Celsius
 */
export function computeDewPoint(tempC: number, rh: number): number {
  const b = 17.27;
  const c = 237.7;

  // Clamp RH to valid range (minimum 1% to avoid unrealistic dew point values)
  const rhClamped = Math.max(1, Math.min(100, rh));

  const alpha = Math.log(rhClamped / 100) + (b * tempC) / (c + tempC);
  const dewPoint = (c * alpha) / (b - alpha);

  return dewPoint;
}

/**
 * Convert Celsius to Fahrenheit
 * @param celsius - Temperature in Celsius
 * @returns Temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert Fahrenheit to Celsius
 * @param fahrenheit - Temperature in Fahrenheit
 * @returns Temperature in Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Convert meters per second to miles per hour
 * @param mps - Speed in meters per second
 * @returns Speed in miles per hour
 */
export function mpsToMph(mps: number): number {
  return mps * 2.23694;
}

/**
 * Convert miles per hour to meters per second
 * @param mph - Speed in miles per hour
 * @returns Speed in meters per second
 */
export function mphToMps(mph: number): number {
  return mph / 2.23694;
}

/**
 * Convert meters per second to kilometers per hour
 * @param mps - Speed in meters per second
 * @returns Speed in kilometers per hour
 */
export function mpsToKmh(mps: number): number {
  return mps * 3.6;
}

/**
 * Convert kilometers per hour to meters per second
 * @param kmh - Speed in kilometers per hour
 * @returns Speed in meters per second
 */
export function kmhToMps(kmh: number): number {
  return kmh / 3.6;
}
