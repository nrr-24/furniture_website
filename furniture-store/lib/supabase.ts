import { createClient } from '@supabase/supabase-js'

const getEnv = (name: string) => {
  const val = process.env[`NEXT_PUBLIC_${name}`] || process.env[name];
  // Handle 'undefined' and 'null' strings from certain CI/CD environments
  if (val === 'undefined' || val === 'null' || !val) return null;
  return val.trim().replace(/^["'](.+)["']$/, '$1'); // Also strip accidental quotes
};

/**
 * Lazy-initialized standard Supabase client
 */
let _supabase: any = null;
export const getSupabase = () => {
  if (!_supabase) {
    const url = getEnv('SUPABASE_URL') || 'https://placeholder.supabase.co';
    const key = getEnv('SUPABASE_ANON_KEY') || 'placeholder-key';
    _supabase = createClient(url, key);
  }
  return _supabase;
};

/**
 * Lazy-initialized Admin Supabase client (service role)
 */
let _supabaseAdmin: any = null;
export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    const url = getEnv('SUPABASE_URL') || 'https://placeholder.supabase.co';
    const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is missing, falling back to anon client');
      return getSupabase();
    }
    
    _supabaseAdmin = createClient(url, serviceKey);
  }
  return _supabaseAdmin;
};

// For backward compatibility with existing imports, we still export these 
// as lazy-initialized proxies or we can just update the imports in the app.
// Update: To keep it clean and avoid refactoring everything, let's use Proxies.

export const supabase = new Proxy({}, {
  get: (target, prop) => getSupabase()[prop]
}) as any;

export const supabaseAdmin = new Proxy({}, {
  get: (target, prop) => getSupabaseAdmin()[prop]
}) as any;
