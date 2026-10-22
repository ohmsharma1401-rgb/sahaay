import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Settings, UserCircle, KeyRound, LogOut } from "lucide-react";
import { DashboardShell, Panel, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession, dashboardPathForRole } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, role } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatar_url, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
      setCity(data.city ?? "");
      setBio(data.bio ?? "");
      setAvatar(data.avatar_url ?? "");
    });
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name, phone, city, bio, avatar_url }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== pw2) return toast.error("Passwords do not match");
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setPw(""); setPw2("");
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth/login", replace: true });
  }

  const nav: NavItem[] = [
    { to: dashboardPathForRole(role), label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile Settings", icon: Settings },
  ];

  return (
    <DashboardShell title="Account" navItems={nav}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Profile settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update your account information and password.</p>
        </div>
        <Button variant="outline" onClick={signOut}><LogOut className="mr-1.5 h-4 w-4" /> Sign out</Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Personal information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label>Full name</Label><Input value={full_name} onChange={(e) => setFullName(e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Avatar URL</Label><Input value={avatar_url} onChange={(e) => setAvatar(e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Bio</Label><Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Account">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><UserCircle className="h-4 w-4 text-primary" /> {user?.email}</li>
              <li className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Role: <span className="font-medium text-foreground capitalize">{role ?? "citizen"}</span></li>
            </ul>
          </Panel>

          <Panel title="Change password">
            <form onSubmit={changePassword} className="grid gap-3">
              <div className="grid gap-1.5"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} /></div>
              <div className="grid gap-1.5"><Label>Confirm password</Label><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} /></div>
              <Button type="submit" disabled={pwSaving}>{pwSaving ? "Updating..." : "Update password"}</Button>
            </form>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
