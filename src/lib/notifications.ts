import { supabase } from "@/integrations/supabase/client";

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  kind: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export async function fetchMyNotifications(userId: string): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export async function markAllRead(userId: string) {
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

export async function pushNotification(input: {
  user_id: string;
  title: string;
  body?: string;
  kind?: string;
  link?: string;
}) {
  await supabase.from("notifications").insert({
    user_id: input.user_id,
    title: input.title,
    body: input.body ?? null,
    kind: input.kind ?? "info",
    link: input.link ?? null,
  });
}
