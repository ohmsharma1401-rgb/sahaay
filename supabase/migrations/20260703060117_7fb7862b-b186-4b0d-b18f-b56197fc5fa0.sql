
-- NGOs table
CREATE TABLE public.ngos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  registration_number TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  mission TEXT,
  category TEXT,
  contact_person TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pin_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_maps_url TEXT,
  working_days TEXT,
  working_hours TEXT,
  emergency_support BOOLEAN NOT NULL DEFAULT false,
  languages TEXT[] NOT NULL DEFAULT '{}',
  services TEXT[] NOT NULL DEFAULT '{}',
  nearby_landmark TEXT,
  logo_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ngos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ngos TO authenticated;
GRANT ALL ON public.ngos TO service_role;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view ngos" ON public.ngos FOR SELECT USING (true);
CREATE POLICY "Owners insert own ngo" ON public.ngos FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own ngo" ON public.ngos FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners delete own ngo" ON public.ngos FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- Gallery
CREATE TABLE public.ngo_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ngo_id UUID NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ngo_gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ngo_gallery TO authenticated;
GRANT ALL ON public.ngo_gallery TO service_role;
ALTER TABLE public.ngo_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view gallery" ON public.ngo_gallery FOR SELECT USING (true);
CREATE POLICY "Owner manage gallery" ON public.ngo_gallery FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND (n.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND (n.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- Appointments
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ngo_id UUID NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citizen create appointment" ON public.appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Citizen view own appointments" ON public.appointments FOR SELECT TO authenticated USING (
  auth.uid() = citizen_id
  OR EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND n.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Owner update appointment" ON public.appointments FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND n.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (true);

-- Help Requests
CREATE TABLE public.help_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ngo_id UUID NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_requests TO authenticated;
GRANT ALL ON public.help_requests TO service_role;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citizen create help_request" ON public.help_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "View help_requests" ON public.help_requests FOR SELECT TO authenticated USING (
  auth.uid() = citizen_id
  OR EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND n.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Owner update help_request" ON public.help_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.ngos n WHERE n.id = ngo_id AND n.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_ngos_updated BEFORE UPDATE ON public.ngos FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER trg_appts_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER trg_help_updated BEFORE UPDATE ON public.help_requests FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Seed 10 NGOs (Anand region). Approx coordinates.
INSERT INTO public.ngos (slug, name, verified, category, description, mission, contact_person, phone, whatsapp, email, address, city, state, pin_code, latitude, longitude, working_days, working_hours, emergency_support, languages, services, nearby_landmark) VALUES
('nav-gujarat-stri-adhikar-sangh', 'Nav Gujarat Stri Adhikar Sangh', true, 'Women''s Rights NGO',
 'Working to protect and promote the rights, dignity and empowerment of women across Gujarat.',
 'To empower women through legal awareness, counseling and community outreach.',
 'Alpa Patel', '9898688981', '9898688981', 'alpapatel816@gmail.com', 'Anand', 'Anand', 'Gujarat', '388001', 22.5568, 72.9505,
 'Mon–Sat', '10:00 AM – 6:00 PM', true, ARRAY['Gujarati','Hindi','English'],
 ARRAY['Women''s Rights','Family Counseling','Domestic Violence','Legal Aid','Community Welfare'], 'Near Amul Dairy'),

('setu-trust-anand', 'SETU Trust Anand', true, 'Social Welfare NGO',
 'A bridge between youth potential and community needs through education and skill development.',
 'Bridging hope through youth development and community support.',
 'SETU Coordinator', '9427011200', '9427011200', 'info@setutrust.org', 'Vallabh Vidyanagar', 'Anand', 'Gujarat', '388120', 22.5580, 72.9260,
 'Mon–Fri', '9:30 AM – 5:30 PM', false, ARRAY['Gujarati','Hindi','English'],
 ARRAY['Education','Community Welfare','Family Counseling'], 'Near Sardar Patel University'),

('madhuvan-foundation', 'Madhuvan Foundation', true, 'Community Welfare NGO',
 'Community-driven foundation running health camps and CSR initiatives.',
 'Serving communities through health, welfare and CSR partnerships.',
 'Madhuvan Team', '9924233993', '9924233993', 'contact@madhuvanfoundation.org', 'Vallabh Vidyanagar', 'Anand', 'Gujarat', '388120', 22.5602, 72.9285,
 'Mon–Sat', '10:00 AM – 7:00 PM', false, ARRAY['Gujarati','Hindi'],
 ARRAY['Community Welfare','Education','Legal Aid'], 'Near BVM College'),

('hasumati-charitable-trust', 'Hasumati Charitable Trust', true, 'Social Services NGO',
 'Charitable trust extending assistance to families in need across Anand.',
 'Providing charity, family assistance and community welfare.',
 'Hasumati Trust', '9898989891', '9898989891', 'info@hasumatitrust.org', 'Vidyanagar Road', 'Anand', 'Gujarat', '388001', 22.5590, 72.9520,
 'Mon–Sat', '10:00 AM – 6:00 PM', false, ARRAY['Gujarati','Hindi'],
 ARRAY['Community Welfare','Family Counseling'], 'Near Anand Railway Station'),

('manav-seva-vikas-charitable-trust', 'Manav Seva ane Vikas Charitable Trust', true, 'Community Development NGO',
 'Community development trust focused on holistic social support.',
 'Community development through service, counseling and social support.',
 'Manav Seva Team', '8128651877', '8128651877', 'info@manavseva.org', 'Karamsad', 'Anand', 'Gujarat', '388325', 22.5470, 72.9110,
 'Mon–Sat', '9:00 AM – 6:00 PM', true, ARRAY['Gujarati','Hindi','English'],
 ARRAY['Community Welfare','Family Counseling','Senior Citizen Support'], 'Near Shree Krishna Hospital'),

('aaria-charitable-trust', 'AARIA Charitable Trust', true, 'Social Welfare NGO',
 'Empowering women and children through education and welfare programs.',
 'Uplifting communities via education and women''s welfare.',
 'AARIA Team', '7779024713', '7779024713', 'contact@aariatrust.org', 'Vithal Udyognagar', 'Anand', 'Gujarat', '388121', 22.5395, 72.9432,
 'Mon–Sat', '10:00 AM – 6:00 PM', false, ARRAY['Gujarati','Hindi','English'],
 ARRAY['Education','Women''s Rights','Community Welfare'], 'Near GIDC'),

('ashadeep-human-development-centre', 'Ashadeep Human Development Centre', true, 'Human Development NGO',
 'Human development centre offering counseling and family support services.',
 'Fostering hope and holistic human development.',
 'Ashadeep Team', '02692-238033', '9427238033', 'info@ashadeep.org', 'Vallabh Vidyanagar', 'Anand', 'Gujarat', '388120', 22.5570, 72.9270,
 'Mon–Sat', '9:30 AM – 6:30 PM', true, ARRAY['Gujarati','Hindi','English'],
 ARRAY['Mental Health Counseling','Family Counseling','Community Welfare'], 'Near VP Science College'),

('jatan-charitable-trust', 'Jatan Charitable Trust', true, 'Child Welfare NGO',
 'Focused on child protection, education and welfare of underprivileged children.',
 'Safeguarding and educating every child.',
 'Jatan Team', '02692-259210', '9427259210', 'support@jatantrust.org', 'Ganesh Chokdi', 'Anand', 'Gujarat', '388001', 22.5585, 72.9550,
 'Mon–Sat', '10:00 AM – 6:00 PM', false, ARRAY['Gujarati','Hindi'],
 ARRAY['Child Protection','Education','Community Welfare'], 'Near Ganesh Chokdi'),

('national-association-for-the-blind-anand', 'National Association for the Blind - Anand', true, 'Disability Support NGO',
 'Working for education, rehabilitation and empowerment of visually impaired citizens.',
 'Equal opportunity and dignity for the visually impaired.',
 'NAB Anand', '9925235528', '9925235528', 'anand@nabindia.org', 'Anand', 'Anand', 'Gujarat', '388001', 22.5615, 72.9498,
 'Mon–Fri', '10:00 AM – 5:00 PM', true, ARRAY['Gujarati','Hindi','English'],
 ARRAY['Education','Community Welfare'], 'Near Town Hall'),

('atmiya-seva-charitable-trust', 'Atmiya Seva Charitable Trust', true, 'Social Welfare NGO',
 'Trust extending welfare and support services with a focus on elderly care.',
 'Compassionate service for the elderly and community.',
 'Atmiya Seva Team', '8320225590', '8320225590', 'info@atmiyaseva.org', 'Vallabh Vidyanagar', 'Anand', 'Gujarat', '388120', 22.5595, 72.9295,
 'Mon–Sat', '9:00 AM – 6:00 PM', false, ARRAY['Gujarati','Hindi'],
 ARRAY['Senior Citizen Support','Community Welfare'], 'Near Nana Bazar');
