
DROP POLICY IF EXISTS "Owner update appointment" ON public.appointments;
CREATE POLICY "Owner update appointment" ON public.appointments FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND n.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND n.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Owner update help_request" ON public.help_requests;
CREATE POLICY "Owner update help_request" ON public.help_requests FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND n.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND n.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
