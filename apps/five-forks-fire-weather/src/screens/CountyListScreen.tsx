/**
 * CountyListScreen
 * Scrollable list of county weather metrics with real-time updates
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useCountyMetrics } from '../hooks/useCountyMetrics';
import { CountyCard } from '../components/CountyCard';
import { CountyMetric } from '../types';

export function CountyListScreen() {
  const { metrics, loading, error } = useCountyMetrics();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading county metrics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>
          Make sure Supabase is configured correctly
        </Text>
      </View>
    );
  }

  // Get unique counties (latest data per county)
  const uniqueMetrics = metrics.reduce((acc: CountyMetric[], current) => {
    const existingIndex = acc.findIndex((m) => m.county === current.county);
    if (existingIndex === -1) {
      acc.push(current);
    } else {
      // Keep the most recent timestamp
      if (new Date(current.timestamp) > new Date(acc[existingIndex].timestamp)) {
        acc[existingIndex] = current;
      }
    }
    return acc;
  }, []);

  const renderItem = ({ item }: { item: CountyMetric }) => (
    <CountyCard metric={item} useFahrenheit={false} useMph={false} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No county metrics available</Text>
      <Text style={styles.emptySubtext}>
        Data will appear here when available from Supabase
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>County Weather Metrics</Text>
        <Text style={styles.headerSubtitle}>
          {uniqueMetrics.length} {uniqueMetrics.length === 1 ? 'county' : 'counties'}
        </Text>
      </View>

      <FlatList
        data={uniqueMetrics}
        renderItem={renderItem}
        keyExtractor={(item) => item.county}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  listContent: {
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
