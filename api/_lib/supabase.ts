import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cleanEnvValue } from '../../server/env.js';

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(cleanEnvValue(process.env.SUPABASE_URL) && cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY));
}

export function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = cleanEnvValue(process.env.SUPABASE_URL);
  const serviceRoleKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin credentials are not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
