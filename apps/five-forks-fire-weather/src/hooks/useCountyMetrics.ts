import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { subscribeToCountyMetrics, unsubscribe } from '../lib/realtime';
import type { CountyMetric } from '../types';

/**
 * Custom hook to subscribe to real-time county metrics data
 * 
 * Fetches initial county metrics from the database and subscribes to real-time updates.
 * Automatically manages subscription lifecycle.
 * 
 * @returns Object containing county metrics array and loading state
 */
export function useCountyMetrics() {
  const [countyMetrics, setCountyMetrics] = useState<CountyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    // Fetch initial county metrics
    async function fetchCountyMetrics() {
      try {
        const { data, error } = await supabase
          .from('county_metrics')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) throw error;

        if (mounted) {
          // Keep only the most recent metric per county
          const latestMetrics = new Map<string, CountyMetric>();
          (data || []).forEach((metric) => {
            if (!latestMetrics.has(metric.county)) {
              latestMetrics.set(metric.county, metric);
            }
          });
          setCountyMetrics(Array.from(latestMetrics.values()));
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching county metrics:', err);
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    fetchCountyMetrics();

    // Subscribe to real-time updates
    const channel = subscribeToCountyMetrics((metric, event) => {
      if (!mounted) return;

      setCountyMetrics((current) => {
        if (event === 'INSERT' || event === 'UPDATE') {
          // Update or add county metric
          const existing = current.find((m) => m.county === metric.county);
          if (existing) {
            // Update existing county with newer data
            return current.map((m) => (m.county === metric.county ? metric : m));
          } else {
            // Add new county
            return [...current, metric];
          }
        } else if (event === 'DELETE') {
          // Remove deleted county metric
          return current.filter((m) => m.county !== metric.county);
        }
        return current;
      });
    });

    // Cleanup on unmount
    return () => {
      mounted = false;
      unsubscribe(channel);
    };
  }, []);

  return { countyMetrics, loading, error };
}
