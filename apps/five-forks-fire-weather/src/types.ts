/**
 * Data types for the Five Forks Fire Weather app
 */

/**
 * Hotspot data from Supabase realtime
 */
export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  intensity: number;
  timestamp: string;
  county: string;
}

/**
 * County metrics data from Supabase realtime
 */
export interface CountyMetric {
  id?: string; // Optional ID field
  county: string;
  temp_c: number;
  rh: number;
  wind_speed_mps: number;
  wind_gust_mps: number;
  timestamp: string;
}

/**
 * Fuel spread calculation result
 */
export interface FuelSpreadResult {
  spreadRate: number; // m/s
  explanation: string;
}

/**
 * Parameters for fuel spread calculations
 */
export interface FuelSpreadParams {
  fuelMoisture: number; // percent
  windSpeed: number; // m/s
  temperature: number; // °C
  slope: number; // degrees
}
