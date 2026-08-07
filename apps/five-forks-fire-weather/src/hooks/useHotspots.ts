import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { subscribeToHotspots, unsubscribe } from '../lib/realtime';
import type { Hotspot } from '../types';

/**
 * Custom hook to subscribe to real-time hotspots data
 * 
 * Fetches initial hotspots from the database and subscribes to real-time updates.
 * Automatically manages subscription lifecycle.
 * 
 * @returns Object containing hotspots array and loading state
 */
export function useHotspots() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    // Fetch initial hotspots
    async function fetchHotspots() {
      try {
        const { data, error } = await supabase
          .from('hotspots')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) throw error;

        if (mounted) {
          setHotspots(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching hotspots:', err);
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    fetchHotspots();

    // Subscribe to real-time updates
    const channel = subscribeToHotspots((hotspot, event) => {
      if (!mounted) return;

      setHotspots((current) => {
        if (event === 'INSERT') {
          // Add new hotspot
          return [hotspot, ...current];
        } else if (event === 'UPDATE') {
          // Update existing hotspot
          return current.map((h) => (h.id === hotspot.id ? hotspot : h));
        } else if (event === 'DELETE') {
          // Remove deleted hotspot
          return current.filter((h) => h.id !== hotspot.id);
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

  return { hotspots, loading, error };
}
