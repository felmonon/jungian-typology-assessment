import { getSessionUserFromCookie } from './auth-utils.js';
import { getSupabaseAdminClient } from './supabase.js';

export async function getSessionUser(cookieHeader: string | undefined): Promise<any | null> {
  const supabase = getSupabaseAdminClient();
  return getSessionUserFromCookie(cookieHeader, supabase);
}
