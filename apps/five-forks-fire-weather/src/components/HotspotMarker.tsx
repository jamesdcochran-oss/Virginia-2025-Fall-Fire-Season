import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Hotspot } from '../types';

interface HotspotMarkerProps {
  hotspot: Hotspot;
}

/**
 * HotspotMarker Component
 * 
 * Visual marker for displaying hotspots on a map
 * Color intensity based on hotspot intensity value
 */
export function HotspotMarker({ hotspot }: HotspotMarkerProps) {
  // Color coding based on intensity
  const getColor = (intensity: number): string => {
    if (intensity >= 80) return '#d32f2f'; // High intensity - red
    if (intensity >= 50) return '#f57c00'; // Medium intensity - orange
    return '#fbc02d'; // Low intensity - yellow
  };

  const markerColor = getColor(hotspot.intensity);

  return (
    <View style={[styles.marker, { backgroundColor: markerColor }]}>
      <Text style={styles.markerText}>🔥</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    fontSize: 16,
  },
});
