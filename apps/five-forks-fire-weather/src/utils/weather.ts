/**
 * Weather utility functions
 * 
 * Provides helper functions for weather calculations and unit conversions
 */

/**
 * Compute dew point using the Magnus-Tetens formula
 * 
 * This is a widely-used approximation for computing dew point temperature
 * from air temperature and relative humidity.
 * 
 * Reference: Magnus, G. (1844); Tetens, O. (1930)
 * Valid for temperatures between -40°C and 50°C
 * 
 * @param tempC - Air temperature in degrees Celsius
 * @param rh - Relative humidity in percent (0-100)
 * @returns Dew point temperature in degrees Celsius
 */
export function computeDewPoint(tempC: number, rh: number): number {
  // Magnus-Tetens formula constants
  const a = 17.27;
  const b = 237.7; // °C
  
  // Clamp RH to valid range
  const rhClamped = Math.max(0.01, Math.min(100, rh));
  
  // Compute alpha parameter
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(rhClamped / 100);
  
  // Compute dew point
  const dewPoint = (b * alpha) / (a - alpha);
  
  return Number(dewPoint.toFixed(2));
}

/**
 * Convert Celsius to Fahrenheit
 * 
 * @param tempC - Temperature in degrees Celsius
 * @returns Temperature in degrees Fahrenheit
 */
export function celsiusToFahrenheit(tempC: number): number {
  return Number(((tempC * 9 / 5) + 32).toFixed(1));
}

/**
 * Convert Fahrenheit to Celsius
 * 
 * @param tempF - Temperature in degrees Fahrenheit
 * @returns Temperature in degrees Celsius
 */
export function fahrenheitToCelsius(tempF: number): number {
  return Number(((tempF - 32) * 5 / 9).toFixed(2));
}

/**
 * Convert meters per second to miles per hour
 * 
 * @param mps - Speed in meters per second
 * @returns Speed in miles per hour
 */
export function mpsToMph(mps: number): number {
  return Number((mps * 2.23694).toFixed(1));
}

/**
 * Convert miles per hour to meters per second
 * 
 * @param mph - Speed in miles per hour
 * @returns Speed in meters per second
 */
export function mphToMps(mph: number): number {
  return Number((mph / 2.23694).toFixed(2));
}

/**
 * Convert meters per second to kilometers per hour
 * 
 * @param mps - Speed in meters per second
 * @returns Speed in kilometers per hour
 */
export function mpsToKph(mps: number): number {
  return Number((mps * 3.6).toFixed(1));
}

/**
 * Format temperature for display with unit
 * 
 * @param tempC - Temperature in Celsius
 * @param useFahrenheit - Whether to display in Fahrenheit
 * @returns Formatted temperature string
 */
export function formatTemperature(tempC: number, useFahrenheit: boolean = false): string {
  if (useFahrenheit) {
    return `${celsiusToFahrenheit(tempC)}°F`;
  }
  return `${tempC.toFixed(1)}°C`;
}

/**
 * Format wind speed for display with unit
 * 
 * @param mps - Wind speed in meters per second
 * @param useMph - Whether to display in miles per hour
 * @returns Formatted wind speed string
 */
export function formatWindSpeed(mps: number, useMph: boolean = false): string {
  if (useMph) {
    return `${mpsToMph(mps)} mph`;
  }
  return `${mps.toFixed(1)} m/s`;
}
