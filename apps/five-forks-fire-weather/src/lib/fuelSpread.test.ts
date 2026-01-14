/**
 * Unit tests for fuel spread calculations
 * 
 * These tests validate that the fuel spread functions produce expected outputs
 * for known inputs and handle edge cases appropriately.
 */

import {
  computeGrassSpread,
  computeTimberLitterSpread,
  computePineStandSpread,
} from './fuelSpread';
import { FuelSpreadParams } from '../types';

describe('Fuel Spread Calculations', () => {
  describe('computeGrassSpread', () => {
    it('should return positive spread rate for normal conditions', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };
      const result = computeGrassSpread(params);
      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.explanation).toBeTruthy();
    });

    it('should increase spread rate with higher wind speed', () => {
      const lowWind: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 2,
        temperature: 25,
        slope: 0,
      };
      const highWind: FuelSpreadParams = {
        ...lowWind,
        windSpeed: 10,
      };
      
      const lowWindResult = computeGrassSpread(lowWind);
      const highWindResult = computeGrassSpread(highWind);
      
      expect(highWindResult.spreadRate).toBeGreaterThan(lowWindResult.spreadRate);
    });

    it('should decrease spread rate with higher moisture', () => {
      const lowMoisture: FuelSpreadParams = {
        fuelMoisture: 5,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };
      const highMoisture: FuelSpreadParams = {
        ...lowMoisture,
        fuelMoisture: 20,
      };
      
      const lowMoistureResult = computeGrassSpread(lowMoisture);
      const highMoistureResult = computeGrassSpread(highMoisture);
      
      expect(highMoistureResult.spreadRate).toBeLessThan(lowMoistureResult.spreadRate);
    });

    it('should increase spread rate with positive slope', () => {
      const flatSlope: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };
      const upSlope: FuelSpreadParams = {
        ...flatSlope,
        slope: 15,
      };
      
      const flatResult = computeGrassSpread(flatSlope);
      const upSlopeResult = computeGrassSpread(upSlope);
      
      expect(upSlopeResult.spreadRate).toBeGreaterThan(flatResult.spreadRate);
    });

    it('should handle extreme conditions gracefully', () => {
      const extreme: FuelSpreadParams = {
        fuelMoisture: 0,
        windSpeed: 20,
        temperature: 45,
        slope: 30,
      };
      
      const result = computeGrassSpread(extreme);
      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.spreadRate).toBeLessThan(1); // Sanity check - should be reasonable
    });
  });

  describe('computeTimberLitterSpread', () => {
    it('should return positive spread rate for normal conditions', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 15,
        windSpeed: 5,
        temperature: 20,
        slope: 0,
      };
      const result = computeTimberLitterSpread(params);
      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.explanation).toBeTruthy();
    });

    it('should have lower wind sensitivity than grass', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 10,
        temperature: 25,
        slope: 0,
      };
      
      const grassResult = computeGrassSpread(params);
      const timberResult = computeTimberLitterSpread(params);
      
      // Timber litter should be less responsive to wind (lower wind coefficient)
      // This is a relative comparison based on our model
      expect(timberResult.spreadRate).toBeLessThan(grassResult.spreadRate);
    });

    it('should handle high moisture content', () => {
      const highMoisture: FuelSpreadParams = {
        fuelMoisture: 30,
        windSpeed: 5,
        temperature: 20,
        slope: 0,
      };
      
      const result = computeTimberLitterSpread(highMoisture);
      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.spreadRate).toBeLessThan(0.001); // Very slow spread
    });
  });

  describe('computePineStandSpread', () => {
    it('should return positive spread rate for normal conditions', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 12,
        windSpeed: 5,
        temperature: 22,
        slope: 5,
      };
      const result = computePineStandSpread(params);
      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.explanation).toContain('Crown fire');
    });

    it('should have higher slope sensitivity', () => {
      const flatSlope: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };
      const steepSlope: FuelSpreadParams = {
        ...flatSlope,
        slope: 20,
      };
      
      const flatResult = computePineStandSpread(flatSlope);
      const steepResult = computePineStandSpread(steepSlope);
      
      expect(steepResult.spreadRate).toBeGreaterThan(flatResult.spreadRate);
    });

    it('should include crown fire note in explanation', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };
      
      const result = computePineStandSpread(params);
      expect(result.explanation).toContain('Crown fire');
      expect(result.explanation).toContain('not modeled');
    });
  });

  describe('All fuel types', () => {
    it('should return valid FuelSpreadResult structure', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 5,
      };

      const grassResult = computeGrassSpread(params);
      const timberResult = computeTimberLitterSpread(params);
      const pineResult = computePineStandSpread(params);

      // All results should have spreadRate and explanation
      expect(typeof grassResult.spreadRate).toBe('number');
      expect(typeof grassResult.explanation).toBe('string');
      expect(typeof timberResult.spreadRate).toBe('number');
      expect(typeof timberResult.explanation).toBe('string');
      expect(typeof pineResult.spreadRate).toBe('number');
      expect(typeof pineResult.explanation).toBe('string');
    });

    it('should handle zero values gracefully', () => {
      const zeroParams: FuelSpreadParams = {
        fuelMoisture: 0,
        windSpeed: 0,
        temperature: 0,
        slope: 0,
      };

      const grassResult = computeGrassSpread(zeroParams);
      const timberResult = computeTimberLitterSpread(zeroParams);
      const pineResult = computePineStandSpread(zeroParams);

      expect(grassResult.spreadRate).toBeGreaterThan(0);
      expect(timberResult.spreadRate).toBeGreaterThan(0);
      expect(pineResult.spreadRate).toBeGreaterThan(0);
    });
  });
});
