/**
 * Supabase Realtime Subscriptions
 * 
 * This module provides abstractions for subscribing to Supabase Realtime channels.
 * It manages subscriptions to the 'hotspots' and 'county_metrics' tables and
 * provides callbacks for INSERT, UPDATE, and DELETE events.
 * 
 * Usage:
 *   const unsubscribe = subscribeToHotspots({
 *     onInsert: (hotspot) => console.log('New hotspot:', hotspot),
 *     onUpdate: (hotspot) => console.log('Updated hotspot:', hotspot),
 *     onDelete: (hotspot) => console.log('Deleted hotspot:', hotspot),
 *   });
 * 
 *   // Later, to cleanup:
 *   unsubscribe();
 */

import { supabase } from './supabase';
import { Hotspot, CountyMetric } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface HotspotCallbacks {
  onInsert?: (hotspot: Hotspot) => void;
  onUpdate?: (hotspot: Hotspot) => void;
  onDelete?: (hotspot: Hotspot) => void;
}

export interface CountyMetricCallbacks {
  onInsert?: (metric: CountyMetric) => void;
  onUpdate?: (metric: CountyMetric) => void;
  onDelete?: (metric: CountyMetric) => void;
}

/**
 * Subscribe to realtime updates on the 'hotspots' table
 * @param callbacks - Object containing callback functions for INSERT, UPDATE, DELETE events
 * @returns Unsubscribe function
 */
export function subscribeToHotspots(callbacks: HotspotCallbacks): () => void {
  const channel: RealtimeChannel = supabase
    .channel('hotspots-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'hotspots' },
      (payload) => {
        if (callbacks.onInsert) {
          callbacks.onInsert(payload.new as Hotspot);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'hotspots' },
      (payload) => {
        if (callbacks.onUpdate) {
          callbacks.onUpdate(payload.new as Hotspot);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'hotspots' },
      (payload) => {
        if (callbacks.onDelete) {
          callbacks.onDelete(payload.old as Hotspot);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to realtime updates on the 'county_metrics' table
 * @param callbacks - Object containing callback functions for INSERT, UPDATE, DELETE events
 * @returns Unsubscribe function
 */
export function subscribeToCountyMetrics(callbacks: CountyMetricCallbacks): () => void {
  const channel: RealtimeChannel = supabase
    .channel('county-metrics-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'county_metrics' },
      (payload) => {
        if (callbacks.onInsert) {
          callbacks.onInsert(payload.new as CountyMetric);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'county_metrics' },
      (payload) => {
        if (callbacks.onUpdate) {
          callbacks.onUpdate(payload.new as CountyMetric);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'county_metrics' },
      (payload) => {
        if (callbacks.onDelete) {
          callbacks.onDelete(payload.old as CountyMetric);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
