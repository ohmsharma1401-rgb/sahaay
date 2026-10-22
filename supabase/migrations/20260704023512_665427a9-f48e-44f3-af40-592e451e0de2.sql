
-- ============ LAWYERS ============
CREATE TABLE public.lawyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  qualification TEXT,
  university TEXT,
  bar_number TEXT,
  experience_years INT NOT NULL DEFAULT 0,
  practice_since INT,
  languages TEXT[] NOT NULL DEFAULT '{}',
  specializations TEXT[] NOT NULL DEFAULT '{}',
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  office_address TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_maps_url TEXT,
  consultation_fee INT,
  available_days TEXT,
  available_time TEXT,
  online_consultation BOOLEAN NOT NULL DEFAULT true,
  offline_consultation BOOLEAN NOT NULL DEFAULT true,
  emergency_consultation BOOLEAN NOT NULL DEFAULT false,
  certificates TEXT[] NOT NULL DEFAULT '{}',
  achievements TEXT[] NOT NULL DEFAULT '{}',
  about TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lawyers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lawyers TO authenticated;
GRANT ALL ON public.lawyers TO service_role;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lawyers public read" ON public.lawyers FOR SELECT USING (true);
CREATE POLICY "Owner insert lawyer" ON public.lawyers FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner update lawyer" ON public.lawyers FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner delete lawyer" ON public.lawyers FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_lawyers_updated BEFORE UPDATE ON public.lawyers FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES public.ngos(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES public.lawyers(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reviews_target_ck CHECK ((ngo_id IS NOT NULL)::int + (lawyer_id IS NOT NULL)::int = 1)
);
CREATE UNIQUE INDEX reviews_uniq_ngo ON public.reviews(citizen_id, ngo_id) WHERE ngo_id IS NOT NULL;
CREATE UNIQUE INDEX reviews_uniq_lawyer ON public.reviews(citizen_id, lawyer_id) WHERE lawyer_id IS NOT NULL;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Citizen insert review" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Citizen update own review" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = citizen_id) WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Citizen delete own review" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = citizen_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  kind TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ SAVED NGOs / LAWYERS ============
CREATE TABLE public.saved_ngos (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ngo_id UUID NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, ngo_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_ngos TO authenticated;
GRANT ALL ON public.saved_ngos TO service_role;
ALTER TABLE public.saved_ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Saved ngos own" ON public.saved_ngos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.saved_lawyers (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lawyer_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_lawyers TO authenticated;
GRANT ALL ON public.saved_lawyers TO service_role;
ALTER TABLE public.saved_lawyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Saved lawyers own" ON public.saved_lawyers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ APPOINTMENTS: support lawyers too ============
ALTER TABLE public.appointments
  ADD COLUMN lawyer_id UUID REFERENCES public.lawyers(id) ON DELETE CASCADE,
  ADD COLUMN type TEXT NOT NULL DEFAULT 'ngo',
  ALTER COLUMN ngo_id DROP NOT NULL;

CREATE POLICY "Lawyer view appointments" ON public.appointments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = appointments.lawyer_id AND l.owner_id = auth.uid()));
CREATE POLICY "Lawyer update appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = appointments.lawyer_id AND l.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = appointments.lawyer_id AND l.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- ============ HELP REQUESTS: richer fields ============
ALTER TABLE public.help_requests
  ADD COLUMN title TEXT,
  ADD COLUMN issue_type TEXT,
  ADD COLUMN urgency TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN location TEXT,
  ADD COLUMN attachment_url TEXT;

-- ============ PROFILES: settings fields ============
ALTER TABLE public.profiles
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN bio TEXT,
  ADD COLUMN city TEXT;

CREATE INDEX IF NOT EXISTS lawyers_city_idx ON public.lawyers(city);
CREATE INDEX IF NOT EXISTS lawyers_verified_idx ON public.lawyers(verified);
CREATE INDEX IF NOT EXISTS reviews_ngo_idx ON public.reviews(ngo_id);
CREATE INDEX IF NOT EXISTS reviews_lawyer_idx ON public.reviews(lawyer_id);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);
