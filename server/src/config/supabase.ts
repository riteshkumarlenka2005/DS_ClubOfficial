import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (url, options) =>
        fetch(url, {
          ...options,
          signal: AbortSignal.timeout(20000) // 20 seconds instead of 10
        }),
    },
  }
);

export default supabase;