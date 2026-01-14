/**
 * Custom hook for managing hotspot data with Supabase realtime
 */

import { useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Hotspot } from '../types';
import { supabase } from '../lib/supabase';
import { subscribeToHotspots, unsubscribe } from '../lib/realtime';

export function useHotspots() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    async function fetchInitialData() {
      try {
        setLoading(true);
        
        // Fetch initial hotspots data
        const { data, error: fetchError } = await supabase
          .from('hotspots')
          .select('*')
          .order('timestamp', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setHotspots(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching hotspots:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch hotspots');
      } finally {
        setLoading(false);
      }
    }

    function setupRealtimeSubscription() {
      // Subscribe to realtime updates
      channel = subscribeToHotspots((payload) => {
        if (payload.eventType === 'INSERT') {
          setHotspots((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setHotspots((prev) =>
            prev.map((hotspot) =>
              hotspot.id === payload.new.id ? payload.new : hotspot
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setHotspots((prev) =>
            prev.filter((hotspot) => hotspot.id !== payload.old.id)
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

  return { hotspots, loading, error };
}
