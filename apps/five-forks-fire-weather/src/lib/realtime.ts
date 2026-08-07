/**
 * Supabase Realtime subscription abstraction
 * Provides simple interface for subscribing to realtime changes on tables
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Hotspot, CountyMetric } from '../types';

type RealtimeCallback<T> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}) => void;

/**
 * Subscribe to hotspots table changes
 * @param callback Function to call when hotspots data changes
 * @returns Channel that can be used to unsubscribe
 */
export function subscribeToHotspots(
  callback: RealtimeCallback<Hotspot>
): RealtimeChannel {
  const channel = supabase
    .channel('hotspots-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'hotspots',
      },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new as Hotspot,
          old: payload.old as Hotspot,
        });
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to county_metrics table changes
 * @param callback Function to call when county metrics data changes
 * @returns Channel that can be used to unsubscribe
 */
export function subscribeToCountyMetrics(
  callback: RealtimeCallback<CountyMetric>
): RealtimeChannel {
  const channel = supabase
    .channel('county-metrics-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'county_metrics',
      },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new as CountyMetric,
          old: payload.old as CountyMetric,
        });
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a realtime channel
 * @param channel The channel to unsubscribe from
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
}
