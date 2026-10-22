
-- 1. Storage RLS: owner-scoped folder policies on 'image' bucket
CREATE POLICY "Users manage own image folder select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'image' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users manage own image folder insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'image' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users manage own image folder update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'image' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'image' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users manage own image folder delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'image' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. Appointments: allow citizens to cancel their own appointments
CREATE POLICY "Citizen delete own appointments" ON public.appointments
  FOR DELETE TO authenticated
  USING (auth.uid() = citizen_id OR has_role(auth.uid(), 'admin'::app_role));

-- 3. NGOs: restrict public visibility to verified rows; owners still see their own
DROP POLICY IF EXISTS "Public can view ngos" ON public.ngos;

CREATE POLICY "Public can view verified ngos" ON public.ngos
  FOR SELECT
  USING (verified = true);

CREATE POLICY "Owners view own ngo" ON public.ngos
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'::app_role));

-- 4. Tighten SECURITY DEFINER has_role: callers may only check their own roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (
        _user_id = auth.uid()
        OR (SELECT auth.jwt() ->> 'role') = 'service_role'
      )
  )
$$;
