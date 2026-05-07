import { createClient } from '@supabase/supabase-js';
import { getSessionUserFromCookie } from '../auth/utils.js';

export async function getSessionUser(cookieHeader: string | undefined): Promise<any | null> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  );

  return getSessionUserFromCookie(cookieHeader, supabase);
}
