/**
 * HotspotMarker component
 * 
 * Custom marker component for displaying fire hotspots on the map.
 * Shows a flame-like indicator with color intensity based on hotspot intensity.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HotspotMarkerProps {
  intensity: number;
}

export function HotspotMarker({ intensity }: HotspotMarkerProps) {
  // Determine color based on intensity (assuming 0-100 scale)
  const getColorForIntensity = (value: number): string => {
    if (value >= 75) return '#d32f2f'; // High intensity - dark red
    if (value >= 50) return '#f44336'; // Medium-high - red
    if (value >= 25) return '#ff9800'; // Medium - orange
    return '#ffc107'; // Low - amber
  };

  const color = getColorForIntensity(intensity);

  return (
    <View style={styles.container}>
      <View style={[styles.marker, { backgroundColor: color }]}>
        <Text style={styles.icon}>🔥</Text>
      </View>
      <View style={[styles.pulse, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 2,
  },
  icon: {
    fontSize: 16,
  },
  pulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.3,
    zIndex: 1,
  },
});
