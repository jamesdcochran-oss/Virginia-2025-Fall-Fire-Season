// TypeScript type definitions for the Five Forks Fire Weather app

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  intensity: number;
  timestamp: string;
  county: string;
}

export interface CountyMetric {
  county: string;
  temp_c: number;
  rh: number; // Relative humidity (%)
  wind_speed_mps: number; // Wind speed in meters per second
  wind_gust_mps: number; // Wind gust in meters per second
  timestamp: string;
}

export interface FuelSpreadResult {
  spreadRate: number; // m/s
  explanation: string;
}

export interface FuelSpreadParams {
  fuelMoisture: number; // percent
  windSpeed: number; // m/s
  temperature: number; // °C
  slope: number; // degrees
}
