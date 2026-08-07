/**
 * Supabase client initialization
 * Reads environment variables for SUPABASE_URL and SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get environment variables
// Note: In production, these should be set via Expo's environment system
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file.');
}

/**
 * Supabase client instance
 * No authentication is configured as per requirements
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // No authentication
    autoRefreshToken: false,
  },
});
