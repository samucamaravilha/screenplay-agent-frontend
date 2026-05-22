-- Fix for 0001: grant table privileges to the `authenticated` role.
-- Without these grants, Postgres rejects every request with
-- 'permission denied for table <name>' before RLS policies are even checked.
-- Idempotent: GRANT statements are safe to re-run.

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.series   to authenticated;
grant select, insert, update, delete on public.arcs     to authenticated;
grant select, insert, update, delete on public.episodes to authenticated;
