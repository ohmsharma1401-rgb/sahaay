import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Star,
  Award,
  Settings as SettingsIcon,
  Plus,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";
import { DashboardShell, StatCard, Panel, EmptyState, type NavItem } from "@/components/dashboard/DashboardShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { fetchMyLawyer, slugify, LAWYER_SPECIALIZATIONS, LAWYER_LANGUAGES, type LawyerRow } from "@/lib/lawyers";
import { fetchReviewsForLawyer, averageRating } from "@/lib/reviews";
import { StarRating } from "@/components/site/StarRating";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/lawyer")({
  component: LawyerDashboard,
});

const nav: NavItem[] = [
  { to: "/dashboard/lawyer", label: "Overview", icon: LayoutDashboard },
  { to: "/profile", label: "My Profile", icon: SettingsIcon },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}


function LawyerDashboard() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [tab, setTab] = useState("overview");

  const { data: lawyer, isLoading } = useQuery({
    queryKey: ["my-lawyer", user?.id],
    queryFn: () => (user ? fetchMyLawyer(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });

  const lawyerId = lawyer?.id;

  const { data: appts = [] } = useQuery({
    queryKey: ["lw-appts", lawyerId],
    queryFn: async () => {
      if (!lawyerId) return [];
      const { data, error } = await supabase.from("appointments").select("*").eq("lawyer_id", lawyerId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!lawyerId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["lw-reviews", lawyerId],
    queryFn: () => (lawyerId ? fetchReviewsForLawyer(lawyerId) : Promise.resolve([])),
    enabled: !!lawyerId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["my-lawyer", user?.id] });

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = appts.filter((a) => a.preferred_date === today).length;
  const pendingCount = appts.filter((a) => a.status === "pending").length;
  const completedCount = appts.filter((a) => a.status === "completed").length;
  const { avg } = averageRating(reviews);

  return (
    <DashboardShell title="Lawyer" navItems={nav}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Lawyer dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your practice, appointments and clients.</p>
        </div>
        {lawyer?.verified && (
          <Badge className="rounded-full bg-emerald/15 text-emerald hover:bg-emerald/20">
            <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Verified lawyer
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl border border-border bg-muted/40" />
      ) : !lawyer ? (
        <CreateLawyerCard onCreated={invalidate} />
      ) : (
        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
            <TabsTrigger value="overview"><LayoutDashboard className="mr-1.5 h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="appointments"><Calendar className="mr-1.5 h-4 w-4" />Appointments</TabsTrigger>
            <TabsTrigger value="clients"><Users className="mr-1.5 h-4 w-4" />Clients</TabsTrigger>
            <TabsTrigger value="reviews"><Star className="mr-1.5 h-4 w-4" />Reviews</TabsTrigger>
            <TabsTrigger value="certificates"><Award className="mr-1.5 h-4 w-4" />Certificates</TabsTrigger>
            <TabsTrigger value="profile"><Briefcase className="mr-1.5 h-4 w-4" />Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Today's appointments" value={String(todayCount)} icon={Calendar} />
              <StatCard label="Pending" value={String(pendingCount)} icon={Briefcase} />
              <StatCard label="Completed" value={String(completedCount)} icon={BadgeCheck} />
              <StatCard label="Average rating" value={avg > 0 ? String(avg) : "—"} icon={Star} />
            </div>
            <div className="mt-6">
              <Panel title="Public profile" action={<Button asChild variant="outline" size="sm"><Link to="/lawyers/$slug" params={{ slug: lawyer.slug }}><ExternalLink className="mr-1 h-3.5 w-3.5" />View</Link></Button>}>
                <p className="text-sm text-muted-foreground">
                  Your profile is {lawyer.verified ? "verified and " : ""}live at <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/lawyers/{lawyer.slug}</code>.
                </p>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <ApptsList lawyerId={lawyer.id} rows={appts} onChanged={() => qc.invalidateQueries({ queryKey: ["lw-appts", lawyer.id] })} />
          </TabsContent>

          <TabsContent value="clients" className="mt-6">
            <Panel title="Clients">
              {appts.length === 0 ? (
                <EmptyState icon={Users} title="No clients yet" description="Client contacts will appear here after bookings." />
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {Array.from(new Map(appts.map((a) => [a.phone, a])).values()).map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.phone} {a.email ? `• ${a.email}` : ""}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Panel title={`Reviews (${reviews.length})`}>
              {reviews.length === 0 ? (
                <EmptyState icon={Star} title="No reviews yet" description="Client reviews will show here." />
              ) : (
                <ul className="space-y-3">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between">
                        <StarRating value={r.rating} />
                        <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            <CertificatesForm lawyer={lawyer} onSaved={invalidate} />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <ProfileForm lawyer={lawyer} onSaved={invalidate} />
          </TabsContent>
        </Tabs>
      )}
    </DashboardShell>
  );
}

function CreateLawyerCard({ onCreated }: { onCreated: () => void }) {
  const { user } = useSession();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!user || !name.trim()) return;
    setLoading(true);
    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from("lawyers").insert({ owner_id: user.id, slug, full_name: name.trim() });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Lawyer profile created — complete your details");
    setName("");
    onCreated();
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-soft">
      <Briefcase className="mx-auto h-8 w-8 text-primary" />
      <h2 className="mt-3 text-lg font-semibold">Create your lawyer profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">Build a professional profile to accept consultations.</p>
      <div className="mx-auto mt-5 flex max-w-md gap-2">
        <Input placeholder="Your full name (e.g. Adv. Priya Shah)" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={create} disabled={loading || !name.trim()}><Plus className="mr-1 h-4 w-4" /> Create</Button>
      </div>
    </div>
  );
}

function ProfileForm({ lawyer, onSaved }: { lawyer: LawyerRow; onSaved: () => void }) {
  const [f, setF] = useState<LawyerRow>(lawyer);
  const [saving, setSaving] = useState(false);
  useEffect(() => setF(lawyer), [lawyer]);

  function set<K extends keyof LawyerRow>(k: K, v: LawyerRow[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }
  function toggleArray(k: "languages" | "specializations", value: string, on: boolean) {
    setF((prev) => ({ ...prev, [k]: on ? Array.from(new Set([...prev[k], value])) : prev[k].filter((x) => x !== value) }));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("lawyers").update({
      full_name: f.full_name, photo_url: f.photo_url, qualification: f.qualification, university: f.university,
      bar_number: f.bar_number, experience_years: f.experience_years, practice_since: f.practice_since,
      languages: f.languages, specializations: f.specializations, phone: f.phone, whatsapp: f.whatsapp,
      email: f.email, office_address: f.office_address, city: f.city, latitude: f.latitude, longitude: f.longitude,
      google_maps_url: f.google_maps_url, consultation_fee: f.consultation_fee, available_days: f.available_days,
      available_time: f.available_time, online_consultation: f.online_consultation, offline_consultation: f.offline_consultation,
      emergency_consultation: f.emergency_consultation, about: f.about,
    }).eq("id", lawyer.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    onSaved();
  }




  return (
    <Panel title="Lawyer profile">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><Input value={f.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
        <Field label="Photo URL"><Input value={f.photo_url ?? ""} onChange={(e) => set("photo_url", e.target.value)} /></Field>
        <Field label="Qualification"><Input value={f.qualification ?? ""} onChange={(e) => set("qualification", e.target.value)} placeholder="LL.B, LL.M" /></Field>
        <Field label="University"><Input value={f.university ?? ""} onChange={(e) => set("university", e.target.value)} /></Field>
        <Field label="Bar Council Reg. #"><Input value={f.bar_number ?? ""} onChange={(e) => set("bar_number", e.target.value)} /></Field>
        <Field label="Experience (years)"><Input type="number" value={f.experience_years} onChange={(e) => set("experience_years", Number(e.target.value) || 0)} /></Field>
        <Field label="Practicing since (year)"><Input type="number" value={f.practice_since ?? ""} onChange={(e) => set("practice_since", e.target.value === "" ? null : Number(e.target.value))} /></Field>
        <Field label="Consultation fee (₹)"><Input type="number" value={f.consultation_fee ?? ""} onChange={(e) => set("consultation_fee", e.target.value === "" ? null : Number(e.target.value))} /></Field>
        <Field label="Phone"><Input value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="WhatsApp"><Input value={f.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
        <Field label="Email"><Input value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="City"><Input value={f.city ?? ""} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Office address"><Input value={f.office_address ?? ""} onChange={(e) => set("office_address", e.target.value)} /></Field>
        <Field label="Google Maps URL"><Input value={f.google_maps_url ?? ""} onChange={(e) => set("google_maps_url", e.target.value)} /></Field>
        <Field label="Available days"><Input value={f.available_days ?? ""} onChange={(e) => set("available_days", e.target.value)} placeholder="Mon–Fri" /></Field>
        <Field label="Available time"><Input value={f.available_time ?? ""} onChange={(e) => set("available_time", e.target.value)} placeholder="10:00 AM – 6:00 PM" /></Field>
        <div className="sm:col-span-2"><Field label="About"><Textarea rows={4} value={f.about ?? ""} onChange={(e) => set("about", e.target.value)} /></Field></div>

        <div className="sm:col-span-2">
          <Label className="text-xs">Specializations</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {LAWYER_SPECIALIZATIONS.map((s) => (
              <label key={s} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs">
                <Checkbox checked={f.specializations.includes(s)} onCheckedChange={(v) => toggleArray("specializations", s, !!v)} />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs">Languages</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {LAWYER_LANGUAGES.map((s) => (
              <label key={s} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs">
                <Checkbox checked={f.languages.includes(s)} onCheckedChange={(v) => toggleArray("languages", s, !!v)} />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2"><Switch id="on" checked={f.online_consultation} onCheckedChange={(v) => set("online_consultation", v)} /><Label htmlFor="on" className="text-sm">Online consultation</Label></div>
        <div className="flex items-center gap-2"><Switch id="off" checked={f.offline_consultation} onCheckedChange={(v) => set("offline_consultation", v)} /><Label htmlFor="off" className="text-sm">In-person consultation</Label></div>
        <div className="flex items-center gap-2"><Switch id="em" checked={f.emergency_consultation} onCheckedChange={(v) => set("emergency_consultation", v)} /><Label htmlFor="em" className="text-sm">Emergency consultation</Label></div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </div>
    </Panel>
  );
}

function CertificatesForm({ lawyer, onSaved }: { lawyer: LawyerRow; onSaved: () => void }) {
  const [certs, setCerts] = useState(lawyer.certificates.join("\n"));
  const [achs, setAchs] = useState(lawyer.achievements.join("\n"));
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    const { error } = await supabase.from("lawyers").update({
      certificates: certs.split("\n").map((s) => s.trim()).filter(Boolean),
      achievements: achs.split("\n").map((s) => s.trim()).filter(Boolean),
    }).eq("id", lawyer.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  }
  return (
    <Panel title="Certificates & achievements">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-xs">Certificates (one per line)</Label>
          <Textarea rows={6} value={certs} onChange={(e) => setCerts(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">Achievements (one per line)</Label>
          <Textarea rows={6} value={achs} onChange={(e) => setAchs(e.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex justify-end"><Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></div>
    </Panel>
  );
}

type Appt = { id: string; name: string; phone: string; email: string | null; preferred_date: string | null; preferred_time: string | null; message: string | null; status: string };

function ApptsList({ lawyerId: _lawyerId, rows, onChanged }: { lawyerId: string; rows: Appt[]; onChanged: () => void }) {
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    onChanged();
  }
  return (
    <Panel title={`Appointments (${rows.length})`}>
      {rows.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments" description="Client bookings appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((a) => (
            <li key={a.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-medium">{a.name} • <span className="text-muted-foreground">{a.phone}</span></p>
                <p className="text-xs text-muted-foreground">{a.preferred_date ?? "any date"} {a.preferred_time ?? ""} {a.email ? `• ${a.email}` : ""}</p>
                {a.message && <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full capitalize">{a.status}</Badge>
                <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} className="h-8 rounded-md border border-border bg-transparent px-2 text-sm">
                  {["pending", "approved", "completed", "cancelled"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
