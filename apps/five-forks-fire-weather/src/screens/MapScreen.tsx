import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { useHotspots } from '../hooks/useHotspots';
import { HotspotMarker } from '../components/HotspotMarker';

/**
 * MapScreen Component
 * 
 * Displays an interactive map with real-time hotspot markers
 * Hotspots are colored by intensity and show details on tap
 */
export function MapScreen() {
  const { hotspots, loading, error } = useHotspots();

  // Default region (Virginia - Five Forks area)
  const defaultRegion = {
    latitude: 37.0,
    longitude: -78.5,
    latitudeDelta: 3.0,
    longitudeDelta: 3.0,
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d32f2f" />
        <Text style={styles.loadingText}>Loading hotspots...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading hotspots</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={defaultRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {hotspots.map((hotspot) => (
          <Marker
            key={hotspot.id}
            coordinate={{
              latitude: hotspot.latitude,
              longitude: hotspot.longitude,
            }}
          >
            <HotspotMarker hotspot={hotspot} />
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>🔥 Hotspot</Text>
                <Text style={styles.calloutText}>
                  County: <Text style={styles.calloutValue}>{hotspot.county}</Text>
                </Text>
                <Text style={styles.calloutText}>
                  Intensity: <Text style={styles.calloutValue}>{hotspot.intensity}</Text>
                </Text>
                <Text style={styles.calloutText}>
                  Time: <Text style={styles.calloutValue}>
                    {new Date(hotspot.timestamp).toLocaleString()}
                  </Text>
                </Text>
                <Text style={styles.calloutText}>
                  Lat: <Text style={styles.calloutValue}>{hotspot.latitude.toFixed(4)}</Text>
                  {' '}Lon: <Text style={styles.calloutValue}>{hotspot.longitude.toFixed(4)}</Text>
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Intensity</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#d32f2f' }]} />
          <Text style={styles.legendText}>High (≥80)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f57c00' }]} />
          <Text style={styles.legendText}>Medium (50-79)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#fbc02d' }]} />
          <Text style={styles.legendText}>Low (&lt;50)</Text>
        </View>
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {hotspots.length} active hotspot{hotspots.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  callout: {
    padding: 12,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  calloutText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  calloutValue: {
    fontWeight: '600',
    color: '#333',
  },
  legend: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  infoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
});
