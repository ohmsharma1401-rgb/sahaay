-- Migration: Admin privileges to view users and login activity tracking

-- 1. Allow admins to view all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins read all profiles'
  ) THEN
    CREATE POLICY "Admins read all profiles" ON public.profiles
      FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- 2. Allow admins to view all user roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins read all user_roles'
  ) THEN
    CREATE POLICY "Admins read all user_roles" ON public.user_roles
      FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- 3. Create login_activity table for auditing logins
CREATE TABLE IF NOT EXISTS public.login_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role public.app_role NOT NULL,
  logged_in_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.login_activity ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'login_activity' AND policyname = 'Users insert own login activity'
  ) THEN
    CREATE POLICY "Users insert own login activity" ON public.login_activity
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'login_activity' AND policyname = 'Admins view all login activity'
  ) THEN
    CREATE POLICY "Admins view all login activity" ON public.login_activity
      FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

GRANT ALL ON public.login_activity TO authenticated;
GRANT ALL ON public.login_activity TO service_role;
