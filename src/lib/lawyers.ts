import { supabase } from "@/integrations/supabase/client";

export type LawyerRow = {
  id: string;
  owner_id: string | null;
  slug: string;
  full_name: string;
  photo_url: string | null;
  qualification: string | null;
  university: string | null;
  bar_number: string | null;
  experience_years: number;
  practice_since: number | null;
  languages: string[];
  specializations: string[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  office_address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  consultation_fee: number | null;
  available_days: string | null;
  available_time: string | null;
  online_consultation: boolean;
  offline_consultation: boolean;
  emergency_consultation: boolean;
  certificates: string[];
  achievements: string[];
  about: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export const LAWYER_SPECIALIZATIONS = [
  "Family Law",
  "Criminal",
  "Women's Rights",
  "Cyber Crime",
  "Property",
  "Consumer",
  "Corporate",
  "Civil",
  "Labour",
  "Tax",
] as const;

export const LAWYER_LANGUAGES = ["English", "Hindi", "Gujarati", "Marathi", "Tamil", "Telugu", "Kannada", "Bengali"] as const;

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function fetchLawyers(): Promise<LawyerRow[]> {
  const { data, error } = await supabase.from("lawyers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LawyerRow[];
}

export async function fetchLawyerBySlug(slug: string): Promise<LawyerRow | null> {
  const { data, error } = await supabase.from("lawyers").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as LawyerRow) ?? null;
}

export async function fetchMyLawyer(userId: string): Promise<LawyerRow | null> {
  const { data, error } = await supabase
    .from("lawyers")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as LawyerRow) ?? null;
}
