/**
 * HotspotMarker component
 * Custom marker for displaying hotspots on the map
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Hotspot } from '../types';

interface HotspotMarkerProps {
  hotspot: Hotspot;
}

export function HotspotMarker({ hotspot }: HotspotMarkerProps) {
  // Determine marker color based on intensity
  const getMarkerColor = (intensity: number): string => {
    if (intensity >= 400) return '#d32f2f'; // High intensity - red
    if (intensity >= 350) return '#f57c00'; // Medium-high - orange
    if (intensity >= 300) return '#fbc02d'; // Medium - yellow
    return '#388e3c'; // Low intensity - green
  };

  const markerColor = getMarkerColor(hotspot.intensity);

  return (
    <Marker
      coordinate={{
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
      }}
      pinColor={markerColor}
    >
      <View style={[styles.marker, { backgroundColor: markerColor }]}>
        <View style={styles.markerInner} />
      </View>
      
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>Hotspot Details</Text>
          <Text style={styles.calloutText}>County: {hotspot.county}</Text>
          <Text style={styles.calloutText}>
            Intensity: {hotspot.intensity.toFixed(1)}
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
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  callout: {
    padding: 8,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 14,
    marginVertical: 2,
  },
});
