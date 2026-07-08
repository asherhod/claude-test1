// Local Supabase connection config -- Phase 1 local build (see ceo/strategy.md,
// "Phase 1 site architecture"). This URL + anon key are meant to be public/
// client-side visible by design: access control is enforced by Postgres Row
// Level Security policies (see supabase-local/supabase/migrations/), not by
// keeping this key secret. Never put a service_role key here.
//
// HOW TO FILL THIS IN (after Docker Desktop is installed):
//   1. cd supabase-local
//   2. npx supabase start
//   3. Copy the "API URL" and "anon key" lines from that command's output into
//      the two fields below.
//
// Left as an obviously-fake placeholder until then, on purpose -- this way the
// contact form fails loudly (network/auth error) instead of silently pretending
// to work when the local stack isn't running yet.
window.SUPABASE_CONFIG = {
  url: 'http://127.0.0.1:54321',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
};
