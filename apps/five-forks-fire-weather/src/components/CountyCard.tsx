/**
 * CountyCard component
 * Displays county weather metrics in a card format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CountyMetric } from '../types';
import { formatTemperature, formatWindSpeed, computeDewPoint } from '../utils/weather';

interface CountyCardProps {
  metric: CountyMetric;
  useFahrenheit?: boolean;
  useMph?: boolean;
}

export function CountyCard({ metric, useFahrenheit = false, useMph = false }: CountyCardProps) {
  const dewPoint = computeDewPoint(metric.temp_c, metric.rh);

  return (
    <View style={styles.card}>
      <Text style={styles.countyName}>{metric.county}</Text>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Temperature:</Text>
          <Text style={styles.metricValue}>
            {formatTemperature(metric.temp_c, useFahrenheit ? 'F' : 'C')}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Relative Humidity:</Text>
          <Text style={styles.metricValue}>{metric.rh.toFixed(1)}%</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Wind Speed:</Text>
          <Text style={styles.metricValue}>
            {formatWindSpeed(metric.wind_speed_mps, useMph ? 'mph' : 'mps')}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Wind Gust:</Text>
          <Text style={styles.metricValue}>
            {formatWindSpeed(metric.wind_gust_mps, useMph ? 'mph' : 'mps')}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Dew Point:</Text>
          <Text style={styles.metricValue}>
            {formatTemperature(dewPoint, useFahrenheit ? 'F' : 'C')}
          </Text>
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
