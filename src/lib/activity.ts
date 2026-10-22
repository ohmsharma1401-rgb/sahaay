import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";

export interface LoginEvent {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: AppRole;
  logged_in_at: string;
}

const STORAGE_KEY = "sahay_login_events_v1";

/**
 * Persists login activity to localStorage cache so it is immediately visible,
 * and also attempts to persist to Supabase database (and touches profiles.updated_at).
 */
export async function recordLoginActivity(params: {
  userId: string;
  email: string;
  fullName?: string;
  role: AppRole;
}) {
  const event: LoginEvent = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    user_id: params.userId,
    email: params.email,
    full_name: params.fullName || "",
    role: params.role,
    logged_in_at: new Date().toISOString(),
  };

  // 1. Save to local storage for instant real-time access
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const existingStr = window.localStorage.getItem(STORAGE_KEY);
      const existing: LoginEvent[] = existingStr ? JSON.parse(existingStr) : [];
      // prepend new event and cap at 100 entries
      const updated = [event, ...existing.filter((e) => e.id !== event.id)].slice(0, 100);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn("Could not cache login event locally:", err);
  }

  // 2. Update user profile's updated_at (which acts as last active / last login timestamp)
  try {
    await supabase
      .from("profiles")
      .update({ updated_at: event.logged_in_at })
      .eq("id", params.userId);
  } catch (err) {
    // Non-blocking if profile update fails
    console.warn("Could not update profile timestamp:", err);
  }

  // 3. Attempt insert into login_activity table (if migration is applied)
  try {
    await (supabase.from("login_activity" as any) as any).insert({
      user_id: params.userId,
      email: params.email,
      full_name: params.fullName ?? null,
      role: params.role,
      logged_in_at: event.logged_in_at,
    });
  } catch {
    // Silently ignore if table doesn't exist yet
  }

  return event;
}

/**
 * Retrieves recent login events from database and local cache combined.
 */
export async function getRecentLoginActivities(): Promise<LoginEvent[]> {
  const events: LoginEvent[] = [];

  // Try fetching from database first
  try {
    const { data, error } = await (supabase.from("login_activity" as any) as any)
      .select("*")
      .order("logged_in_at", { ascending: false })
      .limit(50);
    if (!error && Array.isArray(data)) {
      events.push(...data);
    }
  } catch {
    // DB table might not exist yet
  }

  // Merge with local storage cache
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const existingStr = window.localStorage.getItem(STORAGE_KEY);
      if (existingStr) {
        const cached: LoginEvent[] = JSON.parse(existingStr);
        for (const item of cached) {
          if (!events.some((e) => e.id === item.id || (e.user_id === item.user_id && Math.abs(new Date(e.logged_in_at).getTime() - new Date(item.logged_in_at).getTime()) < 3000))) {
            events.push(item);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Error reading cached logins:", err);
  }

  // Sort by date descending
  return events.sort((a, b) => new Date(b.logged_in_at).getTime() - new Date(a.logged_in_at).getTime());
}
