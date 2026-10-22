import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { dashboardPathForRole, type AppRole } from "@/lib/auth";
import { recordLoginActivity } from "@/lib/activity";
import { User, Scale, Building2, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search: Record<string, unknown>): { role?: AppRole; portal?: string } => ({
    role: (search.role as AppRole) || undefined,
    portal: (search.portal as string) || undefined,
  }),
  component: LoginPage,
});

const loginPortals: {
  value: AppRole;
  title: string;
  badge: string;
  headline: string;
  subheadline: string;
  icon: typeof User;
  accentBg: string;
}[] = [
  {
    value: "citizen",
    title: "Citizen Portal",
    badge: "🧑 Citizen Portal",
    headline: "Citizen Login",
    subheadline: "Sign in to access your help requests, appointments, and confidential support.",
    icon: User,
    accentBg: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
  },
  {
    value: "lawyer",
    title: "Lawyer Portal",
    badge: "⚖️ Legal Professional",
    headline: "Lawyer Login",
    subheadline: "Sign in to manage your legal cases, appointments, and client inquiries.",
    icon: Scale,
    accentBg: "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300",
  },
  {
    value: "ngo_owner",
    title: "NGO Portal",
    badge: "🏢 NGO Management",
    headline: "NGO Organization Login",
    subheadline: "Sign in to manage community support cases, verified listings, and volunteers.",
    icon: Building2,
    accentBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  },
  {
    value: "admin",
    title: "Admin Portal",
    badge: "🛡️ Administrative Console",
    headline: "Admin Console Login",
    subheadline: "Restricted administrative portal to monitor users, verifications, and platform activity.",
    icon: Shield,
    accentBg: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
  },
];

function LoginPage() {
  const search = Route.useSearch();
  const initialRole: AppRole =
    search.role && ["citizen", "lawyer", "ngo_owner", "admin"].includes(search.role)
      ? search.role
      : search.portal === "lawyer"
        ? "lawyer"
        : search.portal === "ngo" || search.portal === "ngo_owner"
          ? "ngo_owner"
          : search.portal === "admin"
            ? "admin"
            : "citizen";

  const [portalRole, setPortalRole] = useState<AppRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (search.role && ["citizen", "lawyer", "ngo_owner", "admin"].includes(search.role)) {
      setPortalRole(search.role as AppRole);
    }
  }, [search.role]);

  const activePortal = loginPortals.find((p) => p.value === portalRole) || loginPortals[0];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Determine user role
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user!.id)
      .limit(1)
      .maybeSingle();

    const actualRole = (roleRow?.role as AppRole) ?? "citizen";

    // Track login activity
    await recordLoginActivity({
      userId: data.user!.id,
      email: data.user!.email || email,
      fullName: data.user!.user_metadata?.full_name || "",
      role: actualRole,
    });

    toast.success(`Welcome back (${actualRole})`);
    navigate({ to: dashboardPathForRole(actualRole) });
  }

  return (
    <div>
      {/* Top Portal Switcher Tabs */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Login Portal</p>
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted/60 p-1">
          {loginPortals.map((p) => {
            const isSelected = portalRole === p.value;
            const Icon = p.icon;
            return (
              <button
                type="button"
                key={p.value}
                onClick={() => setPortalRole(p.value)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all",
                  isSelected
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                <span className="truncate">{p.title.replace(" Portal", "")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Portal Active Banner */}
      <div className={cn("mb-6 flex items-start gap-3 rounded-xl border p-3 text-xs", activePortal.accentBg)}>
        <activePortal.icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <span className="font-bold">{activePortal.badge}</span>
          <p className="mt-0.5 opacity-90">{activePortal.subheadline}</p>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{activePortal.headline}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to your Sahay {activePortal.title.toLowerCase()}.</p>

      {/* Login Form */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={portalRole === "admin" ? "admin@sahay.org" : "you@example.com"}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {portalRole === "admin" && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Admin credentials are required to access the Administrative Console.</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : `Sign in to ${activePortal.title}`}
        </Button>
      </form>

      {/* Create account link if not admin */}
      {portalRole !== "admin" ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have a {activePortal.title.toLowerCase()} account yet?{" "}
          <Link
            to="/auth/register"
            search={{ role: portalRole as any }}
            className="font-semibold text-primary hover:underline"
          >
            Create {activePortal.title.replace(" Portal", "")} account
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Citizen or professional?{" "}
          <button
            type="button"
            onClick={() => setPortalRole("citizen")}
            className="font-semibold text-primary hover:underline"
          >
            Switch to Citizen Portal
          </button>
        </p>
      )}
    </div>
  );
}
