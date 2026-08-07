import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useCountyMetrics } from '../hooks/useCountyMetrics';
import { CountyCard } from '../components/CountyCard';

/**
 * CountyListScreen Component
 * 
 * Displays a scrollable list of county weather metrics
 * Updates in real-time as new data arrives from Supabase
 */
export function CountyListScreen() {
  const { countyMetrics, loading, error } = useCountyMetrics();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d32f2f" />
        <Text style={styles.loadingText}>Loading county metrics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading county metrics</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  if (countyMetrics.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No county metrics available</Text>
        <Text style={styles.emptySubtext}>
          Waiting for data from Supabase...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>County Weather Metrics</Text>
        <Text style={styles.headerSubtitle}>
          {countyMetrics.length} {countyMetrics.length === 1 ? 'county' : 'counties'}
        </Text>
      </View>
      <FlatList
        data={countyMetrics}
        keyExtractor={(item) => item.county}
        renderItem={({ item }) => (
          <CountyCard metric={item} useFahrenheit={true} useMph={true} />
        )}
        contentContainerStyle={styles.listContent}
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
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
