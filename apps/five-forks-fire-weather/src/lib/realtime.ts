import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Hotspot, CountyMetric } from '../types';

/**
 * Supabase Realtime Subscriptions
 * 
 * This module provides a minimal abstraction for subscribing to real-time changes
 * in the 'hotspots' and 'county_metrics' tables.
 * 
 * Usage:
 *   const channel = subscribeToHotspots((hotspot, event) => {
 *     console.log('Hotspot change:', event, hotspot);
 *   });
 *   
 *   // Later, when component unmounts:
 *   unsubscribe(channel);
 */

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export type RealtimeCallback<T> = (payload: T, event: RealtimeEvent) => void;

/**
 * Subscribe to real-time changes in the 'hotspots' table
 * 
 * @param callback - Function called when hotspots are inserted, updated, or deleted
 * @returns RealtimeChannel that can be used to unsubscribe
 */
export function subscribeToHotspots(callback: RealtimeCallback<Hotspot>): RealtimeChannel {
  const channel = supabase
    .channel('hotspots-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hotspots',
      },
      (payload) => {
        const event = payload.eventType as RealtimeEvent;
        const hotspot = payload.new as Hotspot;
        callback(hotspot, event);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to real-time changes in the 'county_metrics' table
 * 
 * @param callback - Function called when county metrics are inserted, updated, or deleted
 * @returns RealtimeChannel that can be used to unsubscribe
 */
export function subscribeToCountyMetrics(callback: RealtimeCallback<CountyMetric>): RealtimeChannel {
  const channel = supabase
    .channel('county-metrics-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'county_metrics',
      },
      (payload) => {
        const event = payload.eventType as RealtimeEvent;
        const metric = payload.new as CountyMetric;
        callback(metric, event);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a realtime channel
 * 
 * @param channel - The channel to unsubscribe from
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
}
