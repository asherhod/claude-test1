// Supabase client for the React frontend -- reads config from Vite env vars
// (see redesign-architecture-plan.md §5) instead of the old shell's
// window.SUPABASE_CONFIG script-tag pattern. Same anon key / RLS posture as
// catalog.js / product.js: this key is meant to be public/client-visible,
// access control is enforced entirely by Postgres RLS policies.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail loudly (null client -> callers show an error state) rather than
// silently pretending to work, same posture as supabase-config.js's comment
// about the old shell.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

if (!supabase && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.error(
    'Supabase env vars missing -- copy web/.env.example to web/.env.local and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.'
  );
}
