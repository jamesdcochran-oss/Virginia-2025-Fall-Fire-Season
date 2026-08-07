import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CountyMetric } from '../types';
import { formatTemperature, formatWindSpeed, computeDewPoint } from '../utils/weather';

interface CountyCardProps {
  metric: CountyMetric;
  useFahrenheit?: boolean;
  useMph?: boolean;
}

/**
 * CountyCard Component
 * 
 * Displays a card with county weather metrics including:
 * - County name
 * - Temperature (°C or °F)
 * - Relative Humidity (%)
 * - Wind Speed (m/s or mph)
 * - Dew Point (computed from temp and RH)
 * - Wind Gust (m/s or mph)
 */
export function CountyCard({ metric, useFahrenheit = false, useMph = false }: CountyCardProps) {
  const dewPoint = computeDewPoint(metric.temp_c, metric.rh);

  return (
    <View style={styles.card}>
      <Text style={styles.countyName}>{metric.county}</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <Text style={styles.label}>Temperature:</Text>
          <Text style={styles.value}>{formatTemperature(metric.temp_c, useFahrenheit)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.label}>Relative Humidity:</Text>
          <Text style={styles.value}>{metric.rh.toFixed(1)}%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.label}>Wind Speed:</Text>
          <Text style={styles.value}>{formatWindSpeed(metric.wind_speed_mps, useMph)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.label}>Dew Point:</Text>
          <Text style={styles.value}>{formatTemperature(dewPoint, useFahrenheit)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.label}>Wind Gust:</Text>
          <Text style={styles.value}>{formatWindSpeed(metric.wind_gust_mps, useMph)}</Text>
        </View>
      </View>
      <Text style={styles.timestamp}>
        Updated: {new Date(metric.timestamp).toLocaleString()}
      </Text>
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
    marginBottom: 12,
    color: '#333',
  },
  metricsContainer: {
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
