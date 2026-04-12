import { createClient } from '@supabase/supabase-js'

/**
 * Helper to get environment variables regardless of whether they have 
 * the NEXT_PUBLIC_ prefix or not.
 */
const getEnv = (name: string) => {
  const val = process.env[`NEXT_PUBLIC_${name}`] || process.env[name];
  return (val === 'undefined' || val === 'null' || !val) ? null : val;
};

const supabaseUrl = getEnv('SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'placeholder-key';
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

// Standard client for both client-side and general server-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin client for privileged server-side operations (like bypassing RLS for storage).
 * Only initialized if the service role key is present.
 */
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase; // Fallback to anon client if service key is missing
