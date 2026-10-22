import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { dashboardPathForRole, type AppRole } from "@/lib/auth";
import { recordLoginActivity } from "@/lib/activity";
import { User, Scale, Building2, Check, ShieldCheck, HeartHandshake, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleChoice = Exclude<AppRole, "admin">;

export const Route = createFileRoute("/auth/register")({
  validateSearch: (search: Record<string, unknown>): { role?: RoleChoice; portal?: string } => ({
    role: (search.role as RoleChoice) || undefined,
    portal: (search.portal as string) || undefined,
  }),
  component: RegisterPage,
});

const portals: {
  value: RoleChoice;
  title: string;
  badge: string;
  headline: string;
  subheadline: string;
  desc: string;
  icon: typeof User;
  accentBg: string;
}[] = [
  {
    value: "citizen",
    title: "Citizen Portal",
    badge: "🧑 Seeking Help",
    headline: "Citizen Registration Portal",
    subheadline: "Create your citizen account to get free, confidential legal aid and NGO support.",
    desc: "I need help with legal, family, or social matters.",
    icon: User,
    accentBg: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
  },
  {
    value: "lawyer",
    title: "Lawyer Portal",
    badge: "⚖️ Legal Professional",
    headline: "Lawyer & Advocate Registration",
    subheadline: "Join the verified legal network on Sahay to receive case inquiries and consultations.",
    desc: "I want to offer legal services and consultation.",
    icon: Scale,
    accentBg: "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300",
  },
  {
    value: "ngo_owner",
    title: "NGO Portal",
    badge: "🏢 Social Aid Org",
    headline: "NGO Organization Registration",
    subheadline: "Register your non-profit organization to support citizens and manage community programs.",
    desc: "I represent a verified NGO or social aid trust.",
    icon: Building2,
    accentBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  },
];

function RegisterPage() {
  const search = Route.useSearch();
  const initialRole: RoleChoice =
    search.role === "lawyer" || search.role === "ngo_owner" || search.role === "citizen"
      ? search.role
      : search.portal === "lawyer"
        ? "lawyer"
        : search.portal === "ngo" || search.portal === "ngo_owner"
          ? "ngo_owner"
          : "citizen";

  const [role, setRole] = useState<RoleChoice>(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keep state in sync if query param changes
  useEffect(() => {
    if (search.role && ["citizen", "lawyer", "ngo_owner"].includes(search.role)) {
      setRole(search.role as RoleChoice);
    }
  }, [search.role]);

  const activePortal = portals.find((p) => p.value === role) || portals[0];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, phone, role },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (authData?.user) {
      await recordLoginActivity({
        userId: authData.user.id,
        email,
        fullName,
        role,
      });
    }

    toast.success("Account created successfully!");
    navigate({ to: dashboardPathForRole(role) });
  }

  return (
    <div>
      {/* Top Portal Switcher Tabs */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Registration Portal</p>
        <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-muted/60 p-1">
          {portals.map((p) => {
            const isSelected = role === p.value;
            const Icon = p.icon;
            return (
              <button
                type="button"
                key={p.value}
                onClick={() => setRole(p.value)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all",
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
      <div className={cn("mb-6 flex items-start gap-3 rounded-xl border p-3.5 text-xs", activePortal.accentBg)}>
        <activePortal.icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <span className="font-bold">{activePortal.badge}</span>
          <p className="mt-0.5 opacity-90">{activePortal.desc}</p>
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{activePortal.headline}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{activePortal.subheadline}</p>

      {/* Registration Form */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              {role === "ngo_owner" ? "Representative Name" : "Full Name"}
            </Label>
            <Input
              id="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === "ngo_owner" ? "Director / Officer Name" : "Your full name"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Create Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        {role === "citizen" && (
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-primary" />
            <span>As a citizen, all services, appointment bookings, and help requests are 100% free.</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Creating account..."
            : role === "citizen"
              ? "Register as Citizen"
              : role === "lawyer"
                ? "Register as Lawyer"
                : "Register NGO Organization"}
        </Button>
      </form>

      {/* Sign in redirect specific to this role portal */}
      <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
        Already have a {activePortal.title.toLowerCase()} account?{" "}
        <Link
          to="/auth/login"
          search={{ role }}
          className="font-semibold text-primary hover:underline"
        >
          Sign in to {activePortal.title}
        </Link>
      </div>
    </div>
  );
}
