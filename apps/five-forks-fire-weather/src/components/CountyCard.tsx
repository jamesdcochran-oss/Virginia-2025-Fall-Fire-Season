/**
 * CountyCard component
 * 
 * Displays a card with county weather metrics including:
 * - County name
 * - Temperature (°C and °F)
 * - Relative Humidity (%)
 * - Wind Speed (m/s and mph)
 * - Dew Point (computed from temp and RH)
 * - Wind Gust (m/s and mph)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CountyMetric } from '../types';
import { computeDewPoint, celsiusToFahrenheit, mpsToMph } from '../utils/weather';

interface CountyCardProps {
  metric: CountyMetric;
}

export function CountyCard({ metric }: CountyCardProps) {
  const dewPoint = computeDewPoint(metric.temp_c, metric.rh);
  const tempF = celsiusToFahrenheit(metric.temp_c);
  const dewPointF = celsiusToFahrenheit(dewPoint);
  const windMph = mpsToMph(metric.wind_speed_mps);
  const gustMph = mpsToMph(metric.wind_gust_mps);

  return (
    <View style={styles.card}>
      <Text style={styles.countyName}>{metric.county}</Text>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Temperature:</Text>
          <Text style={styles.metricValue}>
            {metric.temp_c.toFixed(1)}°C ({tempF.toFixed(1)}°F)
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Humidity:</Text>
          <Text style={styles.metricValue}>{metric.rh.toFixed(0)}%</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Dew Point:</Text>
          <Text style={styles.metricValue}>
            {dewPoint.toFixed(1)}°C ({dewPointF.toFixed(1)}°F)
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Wind Speed:</Text>
          <Text style={styles.metricValue}>
            {metric.wind_speed_mps.toFixed(1)} m/s ({windMph.toFixed(1)} mph)
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Wind Gust:</Text>
          <Text style={styles.metricValue}>
            {metric.wind_gust_mps.toFixed(1)} m/s ({gustMph.toFixed(1)} mph)
          </Text>
        </View>

        <Text style={styles.timestamp}>
          Updated: {new Date(metric.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  metricsContainer: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
