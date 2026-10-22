import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Building2,
  Scale,
  Settings,
  BadgeCheck,
  Activity,
  Search,
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
  Clock,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { DashboardShell, StatCard, Panel, EmptyState, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { getRecentLoginActivities, type LoginEvent } from "@/lib/activity";
import type { AppRole } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  beforeLoad: async ({ context }) => {
    let user = (context as { user?: { id: string; email?: string } }).user;
    if (!user && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("sahay_admin_session") || localStorage.getItem("sahay_admin_session");
        if (stored) {
          user = JSON.parse(stored);
        }
      } catch {
        /* ignore */
      }
    }
    if (!user) throw redirect({ to: "/auth/login?role=admin" });
    const isSuperAdmin =
      user.id?.startsWith("super-admin") ||
      user.email?.toLowerCase() === "ohmsharma1401@gmail.com" ||
      user.email?.toLowerCase() === "amrishs256@gmail.com";
    if (isSuperAdmin) return;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (error || !data) throw redirect({ to: "/" });
  },
  component: AdminDashboard,
});

const nav: NavItem[] = [
  { to: "/dashboard/admin", label: "Admin Console", icon: LayoutDashboard },
  { to: "/profile", label: "My Profile", icon: Settings },
];

interface UnifiedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AppRole;
  createdAt: string;
  lastLoginAt?: string;
  details?: string;
  verified?: boolean;
  activityCount?: number;
}

function timeAgo(dateString?: string): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function AdminDashboard() {
  const qc = useQueryClient();
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | AppRole | "logins">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: ngos = [] } = useQuery({
    queryKey: ["adm-ngos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ngos")
        .select("id,owner_id,name,slug,city,email,phone,contact_person,registration_number,verified,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: lawyers = [] } = useQuery({
    queryKey: ["adm-lawyers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lawyers")
        .select("id,owner_id,full_name,slug,city,email,phone,bar_number,verified,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: appts = [] } = useQuery({
    queryKey: ["adm-appts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id,citizen_id,type,name,phone,email,status,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: help = [] } = useQuery({
    queryKey: ["adm-help"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("help_requests")
        .select("id,citizen_id,name,phone,title,subject,urgency,status,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["adm-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,phone,city,created_at,updated_at")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["adm-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id,role,created_at");
      if (error) return [];
      return data || [];
    },
  });

  const { data: recentLogins = [] } = useQuery({
    queryKey: ["adm-login-activities"],
    queryFn: getRecentLoginActivities,
    refetchInterval: 10000, // auto-refresh logins every 10 seconds
  });

  async function verifyNgo(id: string, on: boolean) {
    const { error } = await supabase.from("ngos").update({ verified: on }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(on ? "NGO verified" : "Verification removed");
    qc.invalidateQueries({ queryKey: ["adm-ngos"] });
  }

  async function verifyLawyer(id: string, on: boolean) {
    const { error } = await supabase.from("lawyers").update({ verified: on }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(on ? "Lawyer verified" : "Verification removed");
    qc.invalidateQueries({ queryKey: ["adm-lawyers"] });
  }

  // Synthesize unified list of all users
  const userMap = new Map<string, UnifiedUser>();

  // 1. Add from profiles
  for (const p of profiles) {
    const roleRecord = userRoles.find((r) => r.user_id === p.id);
    const assignedRole = (roleRecord?.role as AppRole) ?? "citizen";
    const lastLogin = recentLogins.find((l) => l.user_id === p.id);

    userMap.set(p.id, {
      id: p.id,
      name: p.full_name || "Unnamed User",
      email: lastLogin?.email || "—",
      phone: p.phone || undefined,
      role: assignedRole,
      createdAt: p.created_at,
      lastLoginAt: lastLogin?.logged_in_at || p.updated_at,
    });
  }

  // 2. Add from lawyers
  for (const l of lawyers) {
    const key = l.owner_id || l.id;
    const existing = userMap.get(key);
    const lastLogin = recentLogins.find((login) => login.user_id === key || login.email === l.email);

    userMap.set(key, {
      id: key,
      name: l.full_name || existing?.name || "Lawyer",
      email: l.email || existing?.email || "—",
      phone: l.phone || existing?.phone,
      role: "lawyer",
      createdAt: existing?.createdAt || l.created_at,
      lastLoginAt: lastLogin?.logged_in_at || existing?.lastLoginAt,
      verified: l.verified,
      details: [l.city, l.bar_number ? `Bar: ${l.bar_number}` : null].filter(Boolean).join(" • "),
    });
  }

  // 3. Add from NGOs
  for (const n of ngos) {
    const key = n.owner_id || n.id;
    const existing = userMap.get(key);
    const lastLogin = recentLogins.find((login) => login.user_id === key || login.email === n.email);

    userMap.set(key, {
      id: key,
      name: n.name || existing?.name || "NGO",
      email: n.email || existing?.email || "—",
      phone: n.phone || existing?.phone,
      role: "ngo_owner",
      createdAt: existing?.createdAt || n.created_at,
      lastLoginAt: lastLogin?.logged_in_at || existing?.lastLoginAt,
      verified: n.verified,
      details: [n.city, n.registration_number ? `Reg: ${n.registration_number}` : null].filter(Boolean).join(" • "),
    });
  }

  // 4. Add citizen appointments & help requests users
  for (const a of appts) {
    if (a.citizen_id) {
      const existing = userMap.get(a.citizen_id);
      const lastLogin = recentLogins.find((l) => l.user_id === a.citizen_id);
      if (existing) {
        existing.activityCount = (existing.activityCount || 0) + 1;
        if (!existing.phone && a.phone) existing.phone = a.phone;
        if (existing.email === "—" && a.email) existing.email = a.email;
      } else {
        userMap.set(a.citizen_id, {
          id: a.citizen_id,
          name: a.name || "Citizen User",
          email: a.email || lastLogin?.email || "—",
          phone: a.phone || undefined,
          role: "citizen",
          createdAt: a.created_at,
          lastLoginAt: lastLogin?.logged_in_at,
          activityCount: 1,
        });
      }
    }
  }

  for (const h of help) {
    if (h.citizen_id) {
      const existing = userMap.get(h.citizen_id);
      const lastLogin = recentLogins.find((l) => l.user_id === h.citizen_id);
      if (existing) {
        existing.activityCount = (existing.activityCount || 0) + 1;
        if (!existing.phone && h.phone) existing.phone = h.phone;
      } else {
        userMap.set(h.citizen_id, {
          id: h.citizen_id,
          name: h.name || "Citizen User",
          email: lastLogin?.email || "—",
          phone: h.phone || undefined,
          role: "citizen",
          createdAt: h.created_at,
          lastLoginAt: lastLogin?.logged_in_at,
          activityCount: 1,
        });
      }
    }
  }

  // 5. Add any additional logged-in users from recentLogins
  for (const login of recentLogins) {
    const existing = userMap.get(login.user_id);
    if (!existing) {
      userMap.set(login.user_id, {
        id: login.user_id,
        name: login.full_name || login.email.split("@")[0] || "User",
        email: login.email,
        role: login.role,
        createdAt: login.logged_in_at,
        lastLoginAt: login.logged_in_at,
      });
    } else {
      if (existing.email === "—") existing.email = login.email;
      if (!existing.lastLoginAt) existing.lastLoginAt = login.logged_in_at;
    }
  }

  const allUsers = Array.from(userMap.values()).sort(
    (a, b) => new Date(b.lastLoginAt || b.createdAt).getTime() - new Date(a.lastLoginAt || a.createdAt).getTime(),
  );

  const citizenUsers = allUsers.filter((u) => u.role === "citizen");
  const lawyerUsers = allUsers.filter((u) => u.role === "lawyer");
  const ngoUsers = allUsers.filter((u) => u.role === "ngo_owner");
  const adminUsers = allUsers.filter((u) => u.role === "admin");

  const pendingNgos = ngos.filter((n) => !n.verified).length;
  const pendingLawyers = lawyers.filter((l) => !l.verified).length;

  // Filtered users by search & role
  const filteredUsers = allUsers.filter((u) => {
    if (userRoleFilter !== "all" && userRoleFilter !== "logins" && u.role !== userRoleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.details && u.details.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardShell title="Admin" navItems={nav}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
              Admin Portal
            </Badge>
            <span className="text-xs text-muted-foreground">• Live User & System Overview</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Sahay Admin Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor all user logins, registrations for Citizens, Lawyers, and NGOs, and manage verifications.
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Registered Users"
          value={String(allUsers.length || profiles.length || "0")}
          hint={`${citizenUsers.length} citizens, ${lawyerUsers.length} lawyers, ${ngoUsers.length} NGOs`}
          icon={Users}
        />
        <StatCard
          label="Citizen Inquiries & Help"
          value={String(help.length + appts.length)}
          hint={`${help.length} help requests, ${appts.length} appointments`}
          icon={UserIcon}
        />
        <StatCard
          label="Verified NGOs"
          value={String(ngos.filter((n) => n.verified).length)}
          hint={`${pendingNgos} pending verification`}
          icon={Building2}
        />
        <StatCard
          label="Verified Lawyers"
          value={String(lawyers.filter((l) => l.verified).length)}
          hint={`${pendingLawyers} pending verification`}
          icon={Scale}
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="mt-8">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="users" className="flex items-center gap-1.5 font-semibold">
            <Users className="h-4 w-4" />
            Users &amp; Logins ({allUsers.length})
          </TabsTrigger>
          <TabsTrigger value="ngos" className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            NGOs ({ngos.length})
          </TabsTrigger>
          <TabsTrigger value="lawyers" className="flex items-center gap-1.5">
            <Scale className="h-4 w-4" />
            Lawyers ({lawyers.length})
          </TabsTrigger>
          <TabsTrigger value="appts" className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Appointments ({appts.length})
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            Help Requests ({help.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB: USERS & LOGINS */}
        <TabsContent value="users" className="mt-6 space-y-6">
          <Panel
            title={
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">User Management &amp; Login Audit</h2>
                  <p className="text-xs text-muted-foreground">
                    View everyone who has registered or logged in as a Citizen, Lawyer, or NGO.
                  </p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-8 text-xs"
                  />
                </div>
              </div>
            }
          >
            {/* Filter Pills */}
            <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border pb-3">
              <button
                onClick={() => setUserRoleFilter("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  userRoleFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                All Users ({allUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter("citizen")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  userRoleFilter === "citizen"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20",
                )}
              >
                <UserIcon className="h-3 w-3" /> Citizens ({citizenUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter("lawyer")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  userRoleFilter === "lawyer"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20",
                )}
              >
                <Scale className="h-3 w-3" /> Lawyers ({lawyerUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter("ngo_owner")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  userRoleFilter === "ngo_owner"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20",
                )}
              >
                <Building2 className="h-3 w-3" /> NGOs ({ngoUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter("logins")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  userRoleFilter === "logins"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20",
                )}
              >
                <Activity className="h-3 w-3" /> Live Login Activity ({recentLogins.length})
              </button>
            </div>

            {/* If viewing live login activity */}
            {userRoleFilter === "logins" ? (
              <div>
                <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  Recent User Sign-ins &amp; Sessions
                </h3>
                {recentLogins.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No login sessions recorded yet"
                    description="User logins from Citizen, Lawyer, and NGO portals will appear here live."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border text-muted-foreground">
                        <tr>
                          <th className="py-2.5 font-semibold">User / Email</th>
                          <th className="py-2.5 font-semibold">Portal / Role</th>
                          <th className="py-2.5 font-semibold">Login Timestamp</th>
                          <th className="py-2.5 font-semibold">Activity Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {recentLogins.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/40">
                            <td className="py-2.5">
                              <p className="font-semibold text-foreground">{item.full_name || item.email.split("@")[0]}</p>
                              <p className="text-muted-foreground">{item.email}</p>
                            </td>
                            <td className="py-2.5">
                              <Badge
                                className={cn(
                                  "capitalize",
                                  item.role === "citizen" && "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
                                  item.role === "lawyer" && "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
                                  item.role === "ngo_owner" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                                  item.role === "admin" && "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                                )}
                              >
                                {item.role === "ngo_owner" ? "NGO Owner" : item.role}
                              </Badge>
                            </td>
                            <td className="py-2.5 text-muted-foreground">
                              {new Date(item.logged_in_at).toLocaleString()}
                              <span className="ml-1 text-[10px] text-muted-foreground/75">({timeAgo(item.logged_in_at)})</span>
                            </td>
                            <td className="py-2.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Users Table */
              <div>
                {filteredUsers.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No users match your criteria"
                    description="Try adjusting your search query or role filter."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border text-muted-foreground">
                        <tr>
                          <th className="py-2.5 font-semibold">User Details</th>
                          <th className="py-2.5 font-semibold">Role Portal</th>
                          <th className="py-2.5 font-semibold">Contact</th>
                          <th className="py-2.5 font-semibold">Registered</th>
                          <th className="py-2.5 font-semibold">Last Login / Active</th>
                          <th className="py-2.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredUsers.map((u) => {
                          return (
                            <tr key={u.id} className="hover:bg-muted/40">
                              <td className="py-3">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={cn(
                                      "grid h-8 w-8 place-items-center rounded-full text-xs font-bold shrink-0",
                                      u.role === "citizen" && "bg-blue-500/15 text-blue-700 dark:text-blue-300",
                                      u.role === "lawyer" && "bg-purple-500/15 text-purple-700 dark:text-purple-300",
                                      u.role === "ngo_owner" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                                      u.role === "admin" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                                    )}
                                  >
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground text-sm">{u.name}</p>
                                    {u.details && (
                                      <p className="text-[11px] text-muted-foreground">{u.details}</p>
                                    )}
                                    {u.activityCount !== undefined && u.activityCount > 0 && (
                                      <p className="text-[10px] text-blue-600 dark:text-blue-400">
                                        {u.activityCount} help requests / appointments
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <Badge
                                  className={cn(
                                    "capitalize",
                                    u.role === "citizen" && "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
                                    u.role === "lawyer" && "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
                                    u.role === "ngo_owner" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                                    u.role === "admin" && "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                                  )}
                                >
                                  {u.role === "ngo_owner" ? "NGO Owner" : u.role}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <p className="text-foreground">{u.email}</p>
                                {u.phone && <p className="text-[11px] text-muted-foreground">{u.phone}</p>}
                              </td>
                              <td className="py-3 text-muted-foreground">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                              </td>
                              <td className="py-3 text-muted-foreground">
                                <span className="font-medium text-foreground">{timeAgo(u.lastLoginAt)}</span>
                                {u.lastLoginAt && (
                                  <p className="text-[10px] text-muted-foreground">
                                    {new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </td>
                              <td className="py-3">
                                {u.verified !== undefined ? (
                                  u.verified ? (
                                    <Badge className="bg-emerald/15 text-emerald hover:bg-emerald/20">
                                      <BadgeCheck className="mr-1 h-3 w-3" />
                                      Verified
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Pending</Badge>
                                  )
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground">Registered</Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </TabsContent>

        {/* TAB: NGOS */}
        <TabsContent value="ngos" className="mt-6">
          <Panel title={`NGOs (${ngos.length})`}>
            {ngos.length === 0 ? (
              <EmptyState icon={Building2} title="No NGOs" description="NGO registrations will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {ngos.map((n) => (
                  <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-medium">{n.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {n.city ?? "—"} • /{n.slug} {n.contact_person ? `• Contact: ${n.contact_person}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {n.verified ? (
                        <Badge className="rounded-full bg-emerald/15 text-emerald hover:bg-emerald/20">
                          <BadgeCheck className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">Pending</Badge>
                      )}
                      <Button size="sm" variant={n.verified ? "outline" : "default"} onClick={() => verifyNgo(n.id, !n.verified)}>
                        {n.verified ? "Unverify" : "Verify"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        {/* TAB: LAWYERS */}
        <TabsContent value="lawyers" className="mt-6">
          <Panel title={`Lawyers (${lawyers.length})`}>
            {lawyers.length === 0 ? (
              <EmptyState icon={Scale} title="No lawyers" description="Lawyer registrations will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {lawyers.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-medium">{l.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.city ?? "—"} • /{l.slug} {l.bar_number ? `• Bar: ${l.bar_number}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {l.verified ? (
                        <Badge className="rounded-full bg-emerald/15 text-emerald hover:bg-emerald/20">
                          <BadgeCheck className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">Pending</Badge>
                      )}
                      <Button size="sm" variant={l.verified ? "outline" : "default"} onClick={() => verifyLawyer(l.id, !l.verified)}>
                        {l.verified ? "Unverify" : "Verify"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        {/* TAB: APPOINTMENTS */}
        <TabsContent value="appts" className="mt-6">
          <Panel title={`Recent appointments (${appts.length})`}>
            {appts.length === 0 ? (
              <EmptyState icon={Users} title="No appointments" description="Bookings will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {appts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium">
                        {a.name} <span className="text-xs text-muted-foreground">({a.type})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.phone} {a.email ? `• ${a.email}` : ""}
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full capitalize">{a.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        {/* TAB: HELP REQUESTS */}
        <TabsContent value="help" className="mt-6">
          <Panel title={`Recent help requests (${help.length})`}>
            {help.length === 0 ? (
              <EmptyState icon={Users} title="No help requests" description="Citizen requests will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {help.map((h) => (
                  <li key={h.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium">{h.title ?? h.subject}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        By {h.name} ({h.phone}) • Urgency: {h.urgency}
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full capitalize">{h.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
