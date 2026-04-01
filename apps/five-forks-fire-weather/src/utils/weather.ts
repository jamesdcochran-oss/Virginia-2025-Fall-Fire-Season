/**
 * Weather utility functions
 * Includes dew point calculation and unit conversions
 */

/**
 * Compute dew point using Magnus-Tetens formula
 * 
 * Reference: Magnus, G. (1844), Versuche über die Spannkräfte des Wasserdampfs
 * 
 * @param tempC Temperature in Celsius
 * @param rh Relative humidity as percentage (0-100)
 * @returns Dew point in Celsius
 */
export function computeDewPoint(tempC: number, rh: number): number {
  // Magnus-Tetens constants
  const a = 17.27;
  const b = 237.7; // °C
  
  // Calculate alpha
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
  
  // Calculate dew point
  const dewPoint = (b * alpha) / (a - alpha);
  
  return dewPoint;
}

/**
 * Convert Celsius to Fahrenheit
 * @param celsius Temperature in Celsius
 * @returns Temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9 / 5) + 32;
}

/**
 * Convert Fahrenheit to Celsius
 * @param fahrenheit Temperature in Fahrenheit
 * @returns Temperature in Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5 / 9;
}

/**
 * Convert meters per second to miles per hour
 * @param mps Speed in meters per second
 * @returns Speed in miles per hour
 */
export function mpsToMph(mps: number): number {
  return mps * 2.23694;
}

/**
 * Convert miles per hour to meters per second
 * @param mph Speed in miles per hour
 * @returns Speed in meters per second
 */
export function mphToMps(mph: number): number {
  return mph / 2.23694;
}

/**
 * Format temperature with unit
 * @param tempC Temperature in Celsius
 * @param unit 'C' for Celsius, 'F' for Fahrenheit
 * @returns Formatted string
 */
export function formatTemperature(tempC: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${celsiusToFahrenheit(tempC).toFixed(1)}°F`;
  }
  return `${tempC.toFixed(1)}°C`;
}

/**
 * Format wind speed with unit
 * @param windMps Wind speed in meters per second
 * @param unit 'mps' for m/s, 'mph' for miles per hour
 * @returns Formatted string
 */
export function formatWindSpeed(windMps: number, unit: 'mps' | 'mph' = 'mps'): string {
  if (unit === 'mph') {
    return `${mpsToMph(windMps).toFixed(1)} mph`;
  }
  return `${windMps.toFixed(1)} m/s`;
}
