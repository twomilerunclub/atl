import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Service-role client. BYPASSES ROW LEVEL SECURITY.
 *
 * The 'server-only' import above makes the build fail if this file is ever
 * pulled into a Client Component, so the key cannot leak to the browser.
 * Use it only where there is no user session to act on behalf of — currently
 * just the Stripe webhook.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');

  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
