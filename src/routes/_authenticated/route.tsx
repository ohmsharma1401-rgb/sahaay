import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Check for master admin PIN session in local/session storage
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("sahay_admin_session") || localStorage.getItem("sahay_admin_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            return { user: parsed };
          }
        }
      } catch {
        /* ignore */
      }
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth/login" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
