/**
 * Unit tests for fuel spread calculations
 */

import {
  computeGrassSpread,
  computeTimberLitterSpread,
  computePineStandSpread,
} from './fuelSpread';
import { FuelSpreadParams } from '../types';

describe('Fuel Spread Calculations', () => {
  describe('computeGrassSpread', () => {
    it('should return valid spread rate for typical conditions', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 8,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };

      const result = computeGrassSpread(params);

      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.explanation).toContain('Grass spread');
      expect(typeof result.spreadRate).toBe('number');
      expect(typeof result.explanation).toBe('string');
    });

    it('should reduce spread rate with high moisture', () => {
      const lowMoisture: FuelSpreadParams = {
        fuelMoisture: 5,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };

      const highMoisture: FuelSpreadParams = {
        fuelMoisture: 12,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };

      const lowResult = computeGrassSpread(lowMoisture);
      const highResult = computeGrassSpread(highMoisture);

      expect(lowResult.spreadRate).toBeGreaterThan(highResult.spreadRate);
    });

    it('should increase spread rate with higher wind', () => {
      const lowWind: FuelSpreadParams = {
        fuelMoisture: 8,
        windSpeed: 2,
        temperature: 25,
        slope: 0,
      };

      const highWind: FuelSpreadParams = {
        fuelMoisture: 8,
        windSpeed: 10,
        temperature: 25,
        slope: 0,
      };

      const lowResult = computeGrassSpread(lowWind);
      const highResult = computeGrassSpread(highWind);

      expect(highResult.spreadRate).toBeGreaterThan(lowResult.spreadRate);
    });

    it('should increase spread rate on upslope', () => {
      const flatTerrain: FuelSpreadParams = {
        fuelMoisture: 8,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };

      const upslope: FuelSpreadParams = {
        fuelMoisture: 8,
        windSpeed: 5,
        temperature: 25,
        slope: 20,
      };

      const flatResult = computeGrassSpread(flatTerrain);
      const upslopeResult = computeGrassSpread(upslope);

      expect(upslopeResult.spreadRate).toBeGreaterThan(flatResult.spreadRate);
    });
  });

  describe('computeTimberLitterSpread', () => {
    it('should return valid spread rate for typical conditions', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 3,
        temperature: 20,
        slope: 5,
      };

      const result = computeTimberLitterSpread(params);

      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.explanation).toContain('Timber litter spread');
      expect(typeof result.spreadRate).toBe('number');
      expect(typeof result.explanation).toBe('string');
    });

    it('should have lower base spread than grass', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 8,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };

      const grassResult = computeGrassSpread(params);
      const timberResult = computeTimberLitterSpread(params);

      // Timber litter generally spreads slower than grass
      expect(timberResult.spreadRate).toBeLessThan(grassResult.spreadRate);
    });

    it('should be affected by moisture', () => {
      const lowMoisture: FuelSpreadParams = {
        fuelMoisture: 5,
        windSpeed: 3,
        temperature: 20,
        slope: 5,
      };

      const highMoisture: FuelSpreadParams = {
        fuelMoisture: 20,
        windSpeed: 3,
        temperature: 20,
        slope: 5,
      };

      const lowResult = computeTimberLitterSpread(lowMoisture);
      const highResult = computeTimberLitterSpread(highMoisture);

      expect(lowResult.spreadRate).toBeGreaterThan(highResult.spreadRate);
    });
  });

  describe('computePineStandSpread', () => {
    it('should return valid spread rate for typical conditions', () => {
      const params: FuelSpreadParams = {
        fuelMoisture: 12,
        windSpeed: 4,
        temperature: 22,
        slope: 10,
      };

      const result = computePineStandSpread(params);

      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.explanation).toContain('Pine stand spread');
      expect(typeof result.spreadRate).toBe('number');
      expect(typeof result.explanation).toBe('string');
    });

    it('should indicate crown fire potential at high wind and low moisture', () => {
      const crownFireConditions: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 8,
        temperature: 30,
        slope: 15,
      };

      const result = computePineStandSpread(crownFireConditions);

      expect(result.explanation).toContain('Crown fire potential');
    });

    it('should not indicate crown fire at low wind', () => {
      const lowWindConditions: FuelSpreadParams = {
        fuelMoisture: 10,
        windSpeed: 3,
        temperature: 25,
        slope: 15,
      };

      const result = computePineStandSpread(lowWindConditions);

      expect(result.explanation).not.toContain('Crown fire potential');
    });

    it('should not indicate crown fire at high moisture', () => {
      const highMoistureConditions: FuelSpreadParams = {
        fuelMoisture: 18,
        windSpeed: 8,
        temperature: 25,
        slope: 15,
      };

      const result = computePineStandSpread(highMoistureConditions);

      expect(result.explanation).not.toContain('Crown fire potential');
    });

    it('should have higher spread rate with crown fire conditions', () => {
      const noCrownFire: FuelSpreadParams = {
        fuelMoisture: 12,
        windSpeed: 3,
        temperature: 25,
        slope: 10,
      };

      const crownFire: FuelSpreadParams = {
        fuelMoisture: 12,
        windSpeed: 8,
        temperature: 25,
        slope: 10,
      };

      const noCrownResult = computePineStandSpread(noCrownFire);
      const crownResult = computePineStandSpread(crownFire);

      expect(crownResult.spreadRate).toBeGreaterThan(noCrownResult.spreadRate);
    });
  });

  describe('Edge cases', () => {
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

      expect(grassResult.spreadRate).toBeGreaterThanOrEqual(0);
      expect(timberResult.spreadRate).toBeGreaterThanOrEqual(0);
      expect(pineResult.spreadRate).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative slope', () => {
      const downslope: FuelSpreadParams = {
        fuelMoisture: 8,
        windSpeed: 5,
        temperature: 25,
        slope: -20,
      };

      const result = computeGrassSpread(downslope);

      expect(result.spreadRate).toBeGreaterThanOrEqual(0);
    });

    it('should handle extreme values', () => {
      const extremeParams: FuelSpreadParams = {
        fuelMoisture: 50,
        windSpeed: 20,
        temperature: 45,
        slope: 45,
      };

      const grassResult = computeGrassSpread(extremeParams);
      const timberResult = computeTimberLitterSpread(extremeParams);
      const pineResult = computePineStandSpread(extremeParams);

      expect(grassResult.spreadRate).toBeGreaterThanOrEqual(0);
      expect(timberResult.spreadRate).toBeGreaterThanOrEqual(0);
      expect(pineResult.spreadRate).toBeGreaterThanOrEqual(0);
    });
  });
});
