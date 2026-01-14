/**
 * Custom hook for managing county metrics data with Supabase realtime
 */

import { useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CountyMetric } from '../types';
import { supabase } from '../lib/supabase';
import { subscribeToCountyMetrics, unsubscribe } from '../lib/realtime';

export function useCountyMetrics() {
  const [metrics, setMetrics] = useState<CountyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    async function fetchInitialData() {
      try {
        setLoading(true);
        
        // Fetch initial county metrics data
        const { data, error: fetchError } = await supabase
          .from('county_metrics')
          .select('*')
          .order('timestamp', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setMetrics(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching county metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch county metrics');
      } finally {
        setLoading(false);
      }
    }

    function setupRealtimeSubscription() {
      // Subscribe to realtime updates
      channel = subscribeToCountyMetrics((payload) => {
        if (payload.eventType === 'INSERT') {
          setMetrics((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setMetrics((prev) =>
            prev.map((metric) =>
              metric.county === payload.new.county ? payload.new : metric
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setMetrics((prev) =>
            prev.filter((metric) => metric.county !== payload.old.county)
          );
        }
      });
    }

    // Initialize
    fetchInitialData();
    setupRealtimeSubscription();

    // Cleanup
    return () => {
      if (channel) {
        unsubscribe(channel);
      }
    };
  }, []);

  return { metrics, loading, error };
}
