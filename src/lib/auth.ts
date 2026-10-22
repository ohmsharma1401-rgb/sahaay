import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "citizen" | "lawyer" | "ngo_owner" | "admin";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRole(userId: string) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (mounted) setRole((data?.role as AppRole) ?? "citizen");
    }

    function checkAdminSession() {
      if (typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem("sahay_admin_session") || localStorage.getItem("sahay_admin_session");
          if (stored) {
            const adminUser = JSON.parse(stored);
            if (adminUser?.email) {
              setUser(adminUser);
              setRole("admin");
              setLoading(false);
              return true;
            }
          }
        } catch {
          /* ignore */
        }
      }
      return false;
    }

    if (checkAdminSession()) return;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        setUser(data.session.user);
        loadRole(data.session.user.id);
      } else if (!checkAdminSession()) {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user);
        loadRole(session.user.id);
      } else if (!checkAdminSession()) {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}

export function dashboardPathForRole(role: AppRole | null | undefined): string {
  switch (role) {
    case "lawyer":
      return "/dashboard/lawyer";
    case "ngo_owner":
      return "/dashboard/ngo";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/dashboard/citizen";
  }
}
