/**
 * useCountyMetrics hook
 * 
 * This custom hook manages the county metrics data and subscribes to real-time updates
 * from the Supabase 'county_metrics' table.
 * 
 * Usage:
 *   const { metrics, loading, error } = useCountyMetrics();
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { subscribeToCountyMetrics } from '../lib/realtime';
import { CountyMetric } from '../types';

interface UseCountyMetricsResult {
  metrics: CountyMetric[];
  loading: boolean;
  error: Error | null;
}

export function useCountyMetrics(): UseCountyMetricsResult {
  const [metrics, setMetrics] = useState<CountyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('county_metrics')
          .select('*')
          .order('timestamp', { ascending: false });

        if (fetchError) throw fetchError;

        // Get the most recent metric for each county
        const latestMetrics: Record<string, CountyMetric> = {};
        (data || []).forEach((metric: CountyMetric) => {
          if (!latestMetrics[metric.county]) {
            latestMetrics[metric.county] = metric;
          }
        });

        setMetrics(Object.values(latestMetrics));
        setError(null);
      } catch (err) {
        console.error('Error fetching county metrics:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToCountyMetrics({
      onInsert: (newMetric) => {
        setMetrics((prev) => {
          // Replace existing metric for this county or add new one
          const filtered = prev.filter((m) => m.county !== newMetric.county);
          return [newMetric, ...filtered];
        });
      },
      onUpdate: (updatedMetric) => {
        setMetrics((prev) =>
          prev.map((m) => (m.county === updatedMetric.county ? updatedMetric : m))
        );
      },
      onDelete: (deletedMetric) => {
        setMetrics((prev) => prev.filter((m) => m.county !== deletedMetric.county));
      },
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return { metrics, loading, error };
}
