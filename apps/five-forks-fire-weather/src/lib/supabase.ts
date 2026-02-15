import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase configuration from environment variables
// In production, these should be set via .env file or Expo's environment configuration
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
}

/**
 * Supabase client instance
 * Configured to connect to the Supabase project specified in environment variables
 * 
 * Required environment variables:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // No authentication required as per project requirements
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    // Enable realtime subscriptions
    params: {
      eventsPerSecond: 10,
    },
  },
});
