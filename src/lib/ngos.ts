import { supabase } from "@/integrations/supabase/client";

export type NgoRow = {
  id: string;
  owner_id: string | null;
  slug: string;
  name: string;
  registration_number: string | null;
  verified: boolean;
  description: string | null;
  mission: string | null;
  category: string | null;
  contact_person: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  working_days: string | null;
  working_hours: string | null;
  emergency_support: boolean;
  languages: string[];
  services: string[];
  nearby_landmark: string | null;
  logo_url: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
};

export const NGO_SERVICE_OPTIONS = [
  "Family Counseling",
  "Women's Rights",
  "Domestic Violence",
  "Legal Aid",
  "Child Protection",
  "Senior Citizen Support",
  "Cyber Crime Guidance",
  "Property Dispute",
  "Mental Health Counseling",
  "Education Support",
  "Community Welfare",
] as const;

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const LOGO_BUCKET = "image";
const SIGN_TTL = 60 * 60; // 1 hour

export function extractStoragePath(value: string | null): string | null {
  if (!value) return null;
  // If it's already just a path/filename, return as-is
  if (!/^https?:\/\//i.test(value)) return value;
  // Extract from signed or public storage URL: /object/(sign|public)/<bucket>/<path>?...
  const m = value.match(new RegExp(`/object/(?:sign|public)/${LOGO_BUCKET}/([^?]+)`));
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

async function signStoragePaths(paths: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (unique.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(LOGO_BUCKET)
    .createSignedUrls(unique, SIGN_TTL);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  data.forEach((entry, i) => {
    const key = unique[i];
    if (entry.signedUrl) map[key] = entry.signedUrl;
  });
  return map;
}

async function resolveNgoImages<T extends { logo_url: string | null; cover_url: string | null }>(
  rows: T[],
): Promise<T[]> {
  const paths: string[] = [];
  const withPaths = rows.map((row) => {
    const logo = extractStoragePath(row.logo_url);
    const cover = extractStoragePath(row.cover_url);
    if (logo) paths.push(logo);
    if (cover) paths.push(cover);
    return { row, logo, cover };
  });
  const map = await signStoragePaths(paths);
  return withPaths.map(({ row, logo, cover }) => ({
    ...row,
    logo_url: logo ? map[logo] ?? null : null,
    cover_url: cover ? map[cover] ?? null : null,
  }));
}

export async function fetchNgos(): Promise<NgoRow[]> {
  const { data, error } = await supabase
    .from("ngos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return resolveNgoImages((data ?? []) as NgoRow[]);
}

export async function fetchNgoBySlug(slug: string): Promise<NgoRow | null> {
  const { data, error } = await supabase
    .from("ngos")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [resolved] = await resolveNgoImages([data as NgoRow]);
  return resolved ?? null;
}

export async function fetchMyNgo(userId: string): Promise<NgoRow | null> {
  const { data, error } = await supabase
    .from("ngos")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [resolved] = await resolveNgoImages([data as NgoRow]);
  return resolved ?? null;
}

