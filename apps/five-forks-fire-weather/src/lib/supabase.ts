/**
 * Supabase client initialization
 * 
 * This module creates and exports a configured Supabase client for use throughout the app.
 * It reads the SUPABASE_URL and SUPABASE_ANON_KEY from environment variables.
 * 
 * Note: For React Native, you may need to use a library like react-native-dotenv
 * or expo-constants to load environment variables. For development, you can
 * hardcode values here temporarily, but never commit credentials to source control.
 */

import { createClient } from '@supabase/supabase-js';

// In a production app, use proper environment variable handling
// For Expo, you can use expo-constants or a .env file with appropriate tooling
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not found. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Enable session persistence for better performance
    autoRefreshToken: true,
  },
});
