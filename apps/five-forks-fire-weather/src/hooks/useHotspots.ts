/**
 * useHotspots hook
 * 
 * This custom hook manages the hotspots data and subscribes to real-time updates
 * from the Supabase 'hotspots' table.
 * 
 * Usage:
 *   const { hotspots, loading, error } = useHotspots();
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { subscribeToHotspots } from '../lib/realtime';
import { Hotspot } from '../types';

interface UseHotspotsResult {
  hotspots: Hotspot[];
  loading: boolean;
  error: Error | null;
}

export function useHotspots(): UseHotspotsResult {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchHotspots = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('hotspots')
          .select('*')
          .order('timestamp', { ascending: false });

        if (fetchError) throw fetchError;

        setHotspots(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching hotspots:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotspots();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToHotspots({
      onInsert: (newHotspot) => {
        setHotspots((prev) => [newHotspot, ...prev]);
      },
      onUpdate: (updatedHotspot) => {
        setHotspots((prev) =>
          prev.map((h) => (h.id === updatedHotspot.id ? updatedHotspot : h))
        );
      },
      onDelete: (deletedHotspot) => {
        setHotspots((prev) => prev.filter((h) => h.id !== deletedHotspot.id));
      },
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return { hotspots, loading, error };
}
