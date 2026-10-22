import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { dashboardPathForRole, type AppRole } from "@/lib/auth";
import { recordLoginActivity } from "@/lib/activity";
import {
  User,
  Scale,
  Building2,
  Shield,
  AlertCircle,
  KeyRound,
  MailCheck,
  ArrowLeft,
  RefreshCw,
  Mail,
} from "lucide-react";
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
    badge: "🛡️ Administrative Security",
    headline: "Admin Console Login",
    subheadline: "Secure OTP-verified access for Sahay administrators. Sender: ohmsharma1401@gmail.com",
    icon: Shield,
    accentBg: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
  },
];

const ADMIN_SENDER_EMAIL = "ohmsharma1401@gmail.com";

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

  // Admin OTP states
  const [adminStep, setAdminStep] = useState<"email" | "otp">("email");
  const [adminOtp, setAdminOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [adminUsePassword, setAdminUsePassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (search.role && ["citizen", "lawyer", "ngo_owner", "admin"].includes(search.role)) {
      setPortalRole(search.role as AppRole);
    }
  }, [search.role]);

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Listen for auto-login if the user clicked the "Log In" button inside their email
  useEffect(() => {
    async function checkExistingSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user && portalRole === "admin") {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleRow) {
          await recordLoginActivity({
            userId: data.session.user.id,
            email: data.session.user.email || email,
            fullName: data.session.user.user_metadata?.full_name || "Admin",
            role: "admin",
          });
          toast.success("Admin authorized successfully from email!");
          navigate({ to: "/dashboard/admin" });
        }
      }
    }

    checkExistingSession();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") && session?.user && portalRole === "admin") {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleRow) {
          await recordLoginActivity({
            userId: session.user.id,
            email: session.user.email || email,
            fullName: session.user.user_metadata?.full_name || "Admin",
            role: "admin",
          });
          toast.success("Admin authorized successfully from email!");
          navigate({ to: "/dashboard/admin" });
        } else {
          await supabase.auth.signOut();
          toast.error("Access denied. This email is not authorized as an Admin.");
        }
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [portalRole, navigate, email]);

  const activePortal = loginPortals.find((p) => p.value === portalRole) || loginPortals[0];

  // Citizen / Lawyer / NGO Password Login
  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user!.id)
      .limit(1)
      .maybeSingle();

    const actualRole = (roleRow?.role as AppRole) ?? "citizen";

    await recordLoginActivity({
      userId: data.user!.id,
      email: data.user!.email || email,
      fullName: data.user!.user_metadata?.full_name || "",
      role: actualRole,
    });

    toast.success(`Welcome back (${actualRole})`);
    navigate({ to: dashboardPathForRole(actualRole) });
  }

  // Admin: Step 1 - Send OTP via Email
  async function onSendAdminOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your admin email address.");
      return;
    }

    const redirectUrl = `${window.location.origin}/auth/login?role=admin&verified=true`;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectUrl,
      },
    });
    setLoading(false);

    if (error) {
      // If user doesn't exist or shouldCreateUser prevented it, try fallback
      if (error.message.toLowerCase().includes("signups not allowed")) {
        toast.error("This email is not registered. Please contact the platform owner.");
        return;
      }
      // If general error, try standard OTP request
      const retry = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectUrl },
      });
      if (retry.error) {
        toast.error(retry.error.message);
        return;
      }
    }

    setAdminStep("otp");
    setResendCountdown(60);
    toast.success(`Verification code sent to ${email.trim()}! Please check your inbox.`);
  }

  // Admin: Step 2 - Verify OTP
  async function onVerifyAdminOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!adminOtp.trim() || adminOtp.trim().length < 6) {
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: adminOtp.trim(),
      type: "email",
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Invalid or expired OTP code.");
      return;
    }

    if (!data.user) {
      toast.error("Could not verify session. Please try again.");
      return;
    }

    // Verify user has admin role
    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleRow) {
      await supabase.auth.signOut();
      toast.error("Access denied. This account does not have Admin privileges.");
      return;
    }

    await recordLoginActivity({
      userId: data.user.id,
      email: data.user.email || email,
      fullName: data.user.user_metadata?.full_name || "Admin",
      role: "admin",
    });

    toast.success("Admin authenticated successfully!");
    navigate({ to: "/dashboard/admin" });
  }

  // Admin Resend OTP
  async function onResendOtp() {
    if (resendCountdown > 0) return;
    setLoading(true);
    const redirectUrl = `${window.location.origin}/auth/login?role=admin&verified=true`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setResendCountdown(60);
    toast.success(`New code sent to ${email.trim()}!`);
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
                onClick={() => {
                  setPortalRole(p.value);
                  setAdminStep("email");
                  setAdminOtp("");
                }}
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
      <p className="mt-2 text-sm text-muted-foreground">
        {portalRole === "admin"
          ? "Enter your administrator email to receive a secure one-time login code (OTP)."
          : `Sign in to continue to your Sahay ${activePortal.title.toLowerCase()}.`}
      </p>

      {/* ===================== ADMIN OTP WORKFLOW ===================== */}
      {portalRole === "admin" && !adminUsePassword ? (
        <div className="mt-6 space-y-4">
          {/* SMTP Notification Box */}
          <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>Official Sender:</span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-primary font-semibold">
                {ADMIN_SENDER_EMAIL}
              </code>
            </div>
            <p className="mt-1 text-[11px]">
              One-time passwords (OTP) for admin authorization are dispatched from this verified email address.
            </p>
          </div>

          {adminStep === "email" ? (
            /* STEP 1: Enter Email & Request OTP */
            <form onSubmit={onSendAdminOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email">Administrator Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sahay.org or ohmsharma1401@gmail.com"
                  className="font-medium"
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <MailCheck className="h-4 w-4" />
                {loading ? "Sending OTP Code..." : "Send Email Login OTP"}
              </Button>
            </form>
          ) : (
            /* STEP 2: Enter 6-digit OTP Code */
            <form onSubmit={onVerifyAdminOtp} className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground space-y-1">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span>OTP Code Sent to your Email</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Check your inbox for the 6-digit verification code and enter it below.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">
                  Sent to: <strong className="text-foreground">{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminStep("email");
                    setAdminOtp("");
                  }}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" /> Change email
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-otp">Enter 6-Digit OTP Code</Label>
                <Input
                  id="admin-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  required
                  value={adminOtp}
                  onChange={(e) => setAdminOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="text-center font-mono text-3xl font-extrabold tracking-[0.35em] h-14"
                />
              </div>

              <Button type="submit" className="w-full gap-2 text-sm h-11" disabled={loading || adminOtp.length < 6}>
                <KeyRound className="h-4 w-4" />
                {loading ? "Verifying..." : "Verify OTP & Enter Admin Console"}
              </Button>

              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  disabled={resendCountdown > 0 || loading}
                  onClick={onResendOtp}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                  {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : "Resend OTP code"}
                </button>
              </div>
            </form>
          )}

          {/* Toggle Password Fallback */}
          <div className="border-t border-border pt-4 text-center">
            <button
              type="button"
              onClick={() => setAdminUsePassword(true)}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Sign in with password instead
            </button>
          </div>
        </div>
      ) : (
        /* ===================== PASSWORD WORKFLOW (Citizen, Lawyer, NGO, or Admin Password Fallback) ===================== */
        <form onSubmit={onSubmitPassword} className="mt-6 space-y-4">
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
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Admin Password Mode</span>
              </div>
              <button
                type="button"
                onClick={() => setAdminUsePassword(false)}
                className="font-semibold text-amber-900 dark:text-amber-100 hover:underline"
              >
                Use Email OTP
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : `Sign in to ${activePortal.title}`}
          </Button>

          {portalRole === "admin" && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAdminUsePassword(false)}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <MailCheck className="h-3.5 w-3.5" /> Switch to Email OTP Login
              </button>
            </div>
          )}
        </form>
      )}

      {/* Footer links */}
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
          Looking for support?{" "}
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
