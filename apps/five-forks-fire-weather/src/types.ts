// Type definitions for the Five Forks Fire Weather app

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
  rh: number;
  wind_speed_mps: number;
  wind_gust_mps: number;
  timestamp: string;
}

export interface FuelSpreadInput {
  fuelMoisture: number;  // percent
  windSpeed: number;      // m/s
  temperature: number;    // °C
  slope: number;          // degrees
}

export interface FuelSpreadResult {
  spreadRate: number;     // m/s
  explanation: string;
}
