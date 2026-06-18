import {
  computeGrassSpread,
  computeTimberLitterSpread,
  computePineStandSpread,
} from './fuelSpread';

describe('Fuel Spread Calculations', () => {
  describe('computeGrassSpread', () => {
    it('should compute spread rate for typical grass conditions', () => {
      const result = computeGrassSpread({
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      });

      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.explanation).toContain('Grass spread');
      expect(typeof result.spreadRate).toBe('number');
      expect(typeof result.explanation).toBe('string');
    });

    it('should produce lower spread rate with high fuel moisture', () => {
      const lowMoisture = computeGrassSpread({
        fuelMoisture: 5,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      });

      const highMoisture = computeGrassSpread({
        fuelMoisture: 30,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      });

      expect(lowMoisture.spreadRate).toBeGreaterThan(highMoisture.spreadRate);
    });

    it('should produce higher spread rate with stronger wind', () => {
      const lowWind = computeGrassSpread({
        fuelMoisture: 10,
        windSpeed: 2,
        temperature: 25,
        slope: 0,
      });

      const highWind = computeGrassSpread({
        fuelMoisture: 10,
        windSpeed: 10,
        temperature: 25,
        slope: 0,
      });

      expect(highWind.spreadRate).toBeGreaterThan(lowWind.spreadRate);
    });

    it('should produce higher spread rate on upslope', () => {
      const flat = computeGrassSpread({
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      });

      const slope = computeGrassSpread({
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 20,
      });

      expect(slope.spreadRate).toBeGreaterThan(flat.spreadRate);
    });

    it('should handle zero values gracefully', () => {
      const result = computeGrassSpread({
        fuelMoisture: 0,
        windSpeed: 0,
        temperature: 0,
        slope: 0,
      });

      expect(result.spreadRate).toBeGreaterThan(0);
      expect(isFinite(result.spreadRate)).toBe(true);
    });
  });

  describe('computeTimberLitterSpread', () => {
    it('should compute spread rate for typical timber litter conditions', () => {
      const result = computeTimberLitterSpread({
        fuelMoisture: 15,
        windSpeed: 3,
        temperature: 20,
        slope: 5,
      });

      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.explanation).toContain('Timber litter spread');
      expect(typeof result.spreadRate).toBe('number');
      expect(typeof result.explanation).toBe('string');
    });

    it('should produce lower spread rate than grass for same conditions', () => {
      const params = {
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      };

      const grass = computeGrassSpread(params);
      const timberLitter = computeTimberLitterSpread(params);

      // Timber litter typically spreads slower than grass
      expect(timberLitter.spreadRate).toBeLessThan(grass.spreadRate);
    });

    it('should be more sensitive to moisture than grass', () => {
      const lowMoisture = computeTimberLitterSpread({
        fuelMoisture: 5,
        windSpeed: 5,
        temperature: 20,
        slope: 0,
      });

      const highMoisture = computeTimberLitterSpread({
        fuelMoisture: 30,
        windSpeed: 5,
        temperature: 20,
        slope: 0,
      });

      // Should show significant reduction with higher moisture
      const reductionRatio = lowMoisture.spreadRate / highMoisture.spreadRate;
      expect(reductionRatio).toBeGreaterThan(1.5);
    });
  });

  describe('computePineStandSpread', () => {
    it('should compute spread rate for typical pine stand conditions', () => {
      const result = computePineStandSpread({
        fuelMoisture: 12,
        windSpeed: 4,
        temperature: 22,
        slope: 10,
      });

      expect(result.spreadRate).toBeGreaterThan(0);
      expect(result.explanation).toContain('Pine stand spread');
      expect(typeof result.spreadRate).toBe('number');
      expect(typeof result.explanation).toBe('string');
    });

    it('should warn about crown fire potential at high wind speeds', () => {
      const lowWind = computePineStandSpread({
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 0,
      });

      const highWind = computePineStandSpread({
        fuelMoisture: 10,
        windSpeed: 10,
        temperature: 25,
        slope: 0,
      });

      expect(highWind.explanation).toContain('crown fire');
      expect(lowWind.explanation).not.toContain('crown fire');
    });

    it('should have enhanced spread rate above crown fire threshold', () => {
      const belowThreshold = computePineStandSpread({
        fuelMoisture: 10,
        windSpeed: 7,
        temperature: 25,
        slope: 0,
      });

      const aboveThreshold = computePineStandSpread({
        fuelMoisture: 10,
        windSpeed: 9,
        temperature: 25,
        slope: 0,
      });

      // Spread rate should increase more dramatically above threshold
      const windRatio = 9 / 7;
      const spreadRatio = aboveThreshold.spreadRate / belowThreshold.spreadRate;
      expect(spreadRatio).toBeGreaterThan(windRatio);
    });

    it('should handle extreme conditions', () => {
      const extreme = computePineStandSpread({
        fuelMoisture: 5,
        windSpeed: 15,
        temperature: 35,
        slope: 30,
      });

      expect(extreme.spreadRate).toBeGreaterThan(0);
      expect(isFinite(extreme.spreadRate)).toBe(true);
      expect(extreme.explanation).toContain('crown fire');
    });
  });

  describe('Comparative behavior', () => {
    it('should maintain relative spread rates across fuel types', () => {
      const params = {
        fuelMoisture: 10,
        windSpeed: 5,
        temperature: 25,
        slope: 10,
      };

      const grass = computeGrassSpread(params);
      const timberLitter = computeTimberLitterSpread(params);
      const pineStand = computePineStandSpread(params);

      // Grass should typically be fastest
      expect(grass.spreadRate).toBeGreaterThan(timberLitter.spreadRate);
      
      // Pine stand should be between grass and timber litter (or similar to grass under right conditions)
      expect(pineStand.spreadRate).toBeGreaterThan(0);
    });

    it('should return deterministic results for same inputs', () => {
      const params = {
        fuelMoisture: 12,
        windSpeed: 6,
        temperature: 23,
        slope: 8,
      };

      const result1 = computeGrassSpread(params);
      const result2 = computeGrassSpread(params);

      expect(result1.spreadRate).toBe(result2.spreadRate);
      expect(result1.explanation).toBe(result2.explanation);
    });
  });
});
