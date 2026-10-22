import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Calendar,
  Search,
  Bookmark,
  Settings,
  Bell,
  BadgeCheck,
  Trash2,
} from "lucide-react";
import { DashboardShell, StatCard, Panel, EmptyState, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { fetchMyNotifications, markAllRead } from "@/lib/notifications";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/citizen")({
  component: CitizenDashboard,
});

const nav: NavItem[] = [
  { to: "/dashboard/citizen", label: "Overview", icon: LayoutDashboard },
  { to: "/profile", label: "My Profile", icon: Settings },
];

function CitizenDashboard() {
  const { user } = useSession();
  const qc = useQueryClient();
  const uid = user?.id;

  const { data: help = [] } = useQuery({
    queryKey: ["cit-help", uid],
    queryFn: async () => {
      if (!uid) return [];
      const { data, error } = await supabase.from("help_requests").select("*, ngos(name,slug)").eq("citizen_id", uid).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!uid,
  });
  const { data: appts = [] } = useQuery({
    queryKey: ["cit-appts", uid],
    queryFn: async () => {
      if (!uid) return [];
      const { data, error } = await supabase.from("appointments").select("*, ngos(name,slug), lawyers(full_name,slug)").eq("citizen_id", uid).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!uid,
  });
  const { data: savedNgos = [] } = useQuery({
    queryKey: ["cit-saved-ngo", uid],
    queryFn: async () => {
      if (!uid) return [];
      const { data, error } = await supabase.from("saved_ngos").select("ngo_id, ngos(name,slug,city)").eq("user_id", uid);
      if (error) throw error;
      return data;
    },
    enabled: !!uid,
  });
  const { data: savedLawyers = [] } = useQuery({
    queryKey: ["cit-saved-law", uid],
    queryFn: async () => {
      if (!uid) return [];
      const { data, error } = await supabase.from("saved_lawyers").select("lawyer_id, lawyers(full_name,slug,city)").eq("user_id", uid);
      if (error) throw error;
      return data;
    },
    enabled: !!uid,
  });
  const { data: notifs = [] } = useQuery({
    queryKey: ["cit-notifs", uid],
    queryFn: () => (uid ? fetchMyNotifications(uid) : Promise.resolve([])),
    enabled: !!uid,
  });

  async function cancelAppt(id: string) {
    const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Appointment cancelled");
    qc.invalidateQueries({ queryKey: ["cit-appts", uid] });
  }

  async function unsaveNgo(ngoId: string) {
    await supabase.from("saved_ngos").delete().eq("user_id", uid!).eq("ngo_id", ngoId);
    qc.invalidateQueries({ queryKey: ["cit-saved-ngo", uid] });
  }
  async function unsaveLawyer(lawyerId: string) {
    await supabase.from("saved_lawyers").delete().eq("user_id", uid!).eq("lawyer_id", lawyerId);
    qc.invalidateQueries({ queryKey: ["cit-saved-law", uid] });
  }

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <DashboardShell title="Citizen" navItems={nav}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's a summary of your Sahay activity.</p>
        </div>
        <Button asChild><Link to="/find-support"><Search className="mr-1.5 h-4 w-4" /> Find help</Link></Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Help requests" value={String(help.length)} icon={FileText} />
        <StatCard label="Appointments" value={String(appts.length)} icon={Calendar} />
        <StatCard label="Saved" value={String(savedNgos.length + savedLawyers.length)} icon={Bookmark} />
        <StatCard label="Notifications" value={String(unread)} hint={unread ? "New updates" : "All caught up"} icon={Bell} />
      </div>

      <Tabs defaultValue="requests" className="mt-6">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="requests"><FileText className="mr-1.5 h-4 w-4" />My Requests</TabsTrigger>
          <TabsTrigger value="appts"><Calendar className="mr-1.5 h-4 w-4" />Appointments</TabsTrigger>
          <TabsTrigger value="saved"><Bookmark className="mr-1.5 h-4 w-4" />Saved</TabsTrigger>
          <TabsTrigger value="notifs"><Bell className="mr-1.5 h-4 w-4" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <Panel title={`Help requests (${help.length})`}>
            {help.length === 0 ? (
              <EmptyState icon={FileText} title="No help requests yet" description="Start by finding an NGO for your issue." action={<Button asChild size="sm"><Link to="/find-support">Explore</Link></Button>} />
            ) : (
              <ul className="divide-y divide-border">
                {help.map((h) => (
                  <li key={h.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{h.title ?? h.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {h.issue_type ?? "—"} • {h.urgency ?? "normal"} • sent to {h.ngos?.name ?? "NGO"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="rounded-full capitalize">{h.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="appts" className="mt-6">
          <Panel title={`Appointments (${appts.length})`}>
            {appts.length === 0 ? (
              <EmptyState icon={Calendar} title="No appointments" description="Book with an NGO or lawyer to get started." />
            ) : (
              <ul className="divide-y divide-border">
                {appts.map((a) => (
                  <li key={a.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {a.type === "lawyer" ? a.lawyers?.full_name ?? "Lawyer" : a.ngos?.name ?? "NGO"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.preferred_date ?? "any date"} {a.preferred_time ?? ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full capitalize">{a.status}</Badge>
                        {a.status !== "cancelled" && a.status !== "completed" && (
                          <Button variant="outline" size="sm" onClick={() => cancelAppt(a.id)}>Cancel</Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="saved" className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title={`Saved NGOs (${savedNgos.length})`}>
            {savedNgos.length === 0 ? (
              <EmptyState icon={Bookmark} title="Nothing saved" description="Bookmark NGOs to reach them faster." />
            ) : (
              <ul className="divide-y divide-border">
                {savedNgos.map((s) => (
                  <li key={s.ngo_id} className="flex items-center justify-between py-2.5">
                    <Link to="/ngos/$slug" params={{ slug: s.ngos?.slug ?? "" }} className="text-sm font-medium hover:underline">
                      {s.ngos?.name ?? "NGO"}
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => unsaveNgo(s.ngo_id)}><Trash2 className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title={`Saved Lawyers (${savedLawyers.length})`}>
            {savedLawyers.length === 0 ? (
              <EmptyState icon={Bookmark} title="Nothing saved" description="Bookmark lawyers to consult later." />
            ) : (
              <ul className="divide-y divide-border">
                {savedLawyers.map((s) => (
                  <li key={s.lawyer_id} className="flex items-center justify-between py-2.5">
                    <Link to="/lawyers/$slug" params={{ slug: s.lawyers?.slug ?? "" }} className="text-sm font-medium hover:underline">
                      {s.lawyers?.full_name ?? "Lawyer"}
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => unsaveLawyer(s.lawyer_id)}><Trash2 className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="notifs" className="mt-6">
          <Panel
            title={`Notifications (${unread} new)`}
            action={unread ? <Button size="sm" variant="outline" onClick={async () => { await markAllRead(uid!); qc.invalidateQueries({ queryKey: ["cit-notifs", uid] }); }}>Mark all read</Button> : undefined}
          >
            {notifs.length === 0 ? (
              <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
            ) : (
              <ul className="divide-y divide-border">
                {notifs.map((n) => (
                  <li key={n.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      {!n.read && <BadgeCheck className="h-4 w-4 text-primary" />}
                    </div>
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
