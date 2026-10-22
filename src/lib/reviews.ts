import { supabase } from "@/integrations/supabase/client";

export type ReviewRow = {
  id: string;
  citizen_id: string;
  ngo_id: string | null;
  lawyer_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchReviewsForNgo(ngoId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("ngo_id", ngoId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
}

export async function fetchReviewsForLawyer(lawyerId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("lawyer_id", lawyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
}

export function averageRating(rows: { rating: number }[]): { avg: number; count: number } {
  if (rows.length === 0) return { avg: 0, count: 0 };
  const sum = rows.reduce((a, r) => a + r.rating, 0);
  return { avg: Math.round((sum / rows.length) * 10) / 10, count: rows.length };
}
