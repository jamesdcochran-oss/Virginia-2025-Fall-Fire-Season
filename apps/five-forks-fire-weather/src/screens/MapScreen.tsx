/**
 * MapScreen
 * 
 * Displays an interactive map with fire hotspot markers.
 * Hotspots are loaded from Supabase and update in real-time.
 * Tapping a marker shows details in a callout.
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { useHotspots } from '../hooks/useHotspots';
import { HotspotMarker } from '../components/HotspotMarker';

export function MapScreen() {
  const { hotspots, loading, error } = useHotspots();

  // Default region: Virginia (approximate center)
  const initialRegion: Region = {
    latitude: 37.5,
    longitude: -78.5,
    latitudeDelta: 3,
    longitudeDelta: 3,
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
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {hotspots.map((hotspot) => (
          <Marker
            key={hotspot.id}
            coordinate={{
              latitude: hotspot.latitude,
              longitude: hotspot.longitude,
            }}
          >
            <HotspotMarker intensity={hotspot.intensity} />
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Fire Hotspot</Text>
                <Text style={styles.calloutText}>
                  County: {hotspot.county}
                </Text>
                <Text style={styles.calloutText}>
                  Intensity: {hotspot.intensity.toFixed(0)}
                </Text>
                <Text style={styles.calloutText}>
                  Time: {new Date(hotspot.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.calloutText}>
                  Location: {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  map: {
    flex: 1,
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
  },
  callout: {
    padding: 8,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  calloutText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  statusBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
