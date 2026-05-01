DROP POLICY IF EXISTS "public_read_approved_events" ON public.events;
DROP POLICY IF EXISTS "anyone_can_submit_events" ON public.events;
DROP POLICY IF EXISTS "admin_full_access_events" ON public.events;
DROP POLICY IF EXISTS "public_read_organizations" ON public.organizations;
DROP POLICY IF EXISTS "admin_manage_organizations" ON public.organizations;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
