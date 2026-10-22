import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Building2,
  ListChecks,
  CalendarClock,
  MessageSquare,
  Images,
  Settings as SettingsIcon,
  Plus,
  BadgeCheck,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  DashboardShell,
  StatCard,
  Panel,
  EmptyState,
  type NavItem,
} from "@/components/dashboard/DashboardShell";
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
import { fetchMyNgo, NGO_SERVICE_OPTIONS, extractStoragePath, type NgoRow } from "@/lib/ngos";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/ngo")({
  component: NGODashboard,
});

const nav: NavItem[] = [
  { to: "/dashboard/ngo", label: "Overview", icon: LayoutDashboard },
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}


function NGODashboard() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [tab, setTab] = useState("overview");

  const { data: ngo, isLoading } = useQuery({
    queryKey: ["my-ngo", user?.id],
    queryFn: () => (user ? fetchMyNgo(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });

  const ngoId = ngo?.id;

  const { data: appointments = [] } = useQuery({
    queryKey: ["ngo-appointments", ngoId],
    queryFn: async () => {
      if (!ngoId) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("ngo_id", ngoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!ngoId,
  });

  const { data: helpRequests = [] } = useQuery({
    queryKey: ["ngo-help", ngoId],
    queryFn: async () => {
      if (!ngoId) return [];
      const { data, error } = await supabase
        .from("help_requests")
        .select("*")
        .eq("ngo_id", ngoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!ngoId,
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ["ngo-gallery", ngoId],
    queryFn: async () => {
      if (!ngoId) return [];
      const { data, error } = await supabase
        .from("ngo_gallery")
        .select("*")
        .eq("ngo_id", ngoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!ngoId,
  });

  const invalidateNgo = () => qc.invalidateQueries({ queryKey: ["my-ngo", user?.id] });

  return (
    <DashboardShell title="NGO" navItems={nav}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">NGO dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your organization profile, services, appointments and requests.
          </p>
        </div>
        {ngo?.verified && (
          <Badge className="rounded-full bg-emerald/15 text-emerald hover:bg-emerald/20">
            <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Verified NGO
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl border border-border bg-muted/40" />
      ) : !ngo ? (
        <CreateNgoCard onCreated={invalidateNgo} />
      ) : (
        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
            <TabsTrigger value="overview"><LayoutDashboard className="mr-1.5 h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="profile"><Building2 className="mr-1.5 h-4 w-4" />Profile</TabsTrigger>
            <TabsTrigger value="services"><ListChecks className="mr-1.5 h-4 w-4" />Services</TabsTrigger>
            <TabsTrigger value="appointments"><CalendarClock className="mr-1.5 h-4 w-4" />Appointments</TabsTrigger>
            <TabsTrigger value="help"><MessageSquare className="mr-1.5 h-4 w-4" />Help Requests</TabsTrigger>
            <TabsTrigger value="gallery"><Images className="mr-1.5 h-4 w-4" />Gallery</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="mr-1.5 h-4 w-4" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Appointments" value={String(appointments.length)} icon={CalendarClock} />
              <StatCard label="Help requests" value={String(helpRequests.length)} icon={MessageSquare} />
              <StatCard label="Services listed" value={String(ngo.services.length)} icon={ListChecks} />
              <StatCard label="Verification" value={ngo.verified ? "Verified" : "Pending"} icon={BadgeCheck} />
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Panel title="Latest appointments">
                {appointments.length === 0 ? (
                  <EmptyState icon={CalendarClock} title="No appointments yet" description="Requests from citizens will appear here." />
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {appointments.slice(0, 5).map((a) => (
                      <li key={a.id} className="flex items-center justify-between py-2.5">
                        <div>
                          <p className="font-medium">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.phone} • {a.preferred_date ?? "no date"}</p>
                        </div>
                        <Badge variant="secondary" className="rounded-full">{a.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title="Latest help requests">
                {helpRequests.length === 0 ? (
                  <EmptyState icon={MessageSquare} title="No help requests" description="Incoming help requests will appear here." />
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {helpRequests.slice(0, 5).map((h) => (
                      <li key={h.id} className="flex items-center justify-between py-2.5">
                        <div>
                          <p className="font-medium">{h.subject}</p>
                          <p className="text-xs text-muted-foreground">{h.name} • {h.phone}</p>
                        </div>
                        <Badge variant="secondary" className="rounded-full">{h.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <ProfileForm ngo={ngo} onSaved={invalidateNgo} />
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <ServicesForm ngo={ngo} onSaved={invalidateNgo} />
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <AppointmentsList ngoId={ngo.id} rows={appointments} onChanged={() => qc.invalidateQueries({ queryKey: ["ngo-appointments", ngo.id] })} />
          </TabsContent>

          <TabsContent value="help" className="mt-6">
            <HelpList ngoId={ngo.id} rows={helpRequests} onChanged={() => qc.invalidateQueries({ queryKey: ["ngo-help", ngo.id] })} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <GalleryManager ngoId={ngo.id} rows={gallery} onChanged={() => qc.invalidateQueries({ queryKey: ["ngo-gallery", ngo.id] })} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsPanel ngo={ngo} onDeleted={invalidateNgo} />
          </TabsContent>
        </Tabs>
      )}
    </DashboardShell>
  );
}

function CreateNgoCard({ onCreated }: { onCreated: () => void }) {
  const { user } = useSession();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!user || !name.trim()) return;
    setLoading(true);
    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from("ngos").insert({
      owner_id: user.id,
      slug,
      name: name.trim(),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("NGO created — complete your profile");
    setName("");
    onCreated();
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-soft">
      <Building2 className="mx-auto h-8 w-8 text-primary" />
      <h2 className="mt-3 text-lg font-semibold">Register your NGO</h2>
      <p className="mt-1 text-sm text-muted-foreground">Create an organization profile to start receiving requests.</p>
      <div className="mx-auto mt-5 flex max-w-md gap-2">
        <Input placeholder="Organization name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={create} disabled={loading || !name.trim()}>
          <Plus className="mr-1 h-4 w-4" /> Create
        </Button>
      </div>
    </div>
  );
}

function ProfileForm({ ngo, onSaved }: { ngo: NgoRow; onSaved: () => void }) {
  const [f, setF] = useState<NgoRow>(ngo);
  const [saving, setSaving] = useState(false);
  useEffect(() => setF(ngo), [ngo]);

  function set<K extends keyof NgoRow>(k: K, v: NgoRow[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("ngos")
      .update({
        name: f.name,
        registration_number: f.registration_number,
        description: f.description,
        mission: f.mission,
        category: f.category,
        contact_person: f.contact_person,
        phone: f.phone,
        whatsapp: f.whatsapp,
        email: f.email,
        website: f.website,
        address: f.address,
        city: f.city,
        state: f.state,
        pin_code: f.pin_code,
        latitude: f.latitude,
        longitude: f.longitude,
        google_maps_url: f.google_maps_url,
        working_days: f.working_days,
        working_hours: f.working_hours,
        emergency_support: f.emergency_support,
        languages: f.languages,
        nearby_landmark: f.nearby_landmark,
        logo_url: extractStoragePath(f.logo_url),
        cover_url: extractStoragePath(f.cover_url),

      })
      .eq("id", ngo.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    onSaved();
  }




  return (
    <Panel title="NGO profile">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="NGO name"><Input value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Registration number"><Input value={f.registration_number ?? ""} onChange={(e) => set("registration_number", e.target.value)} /></Field>
        <Field label="Category"><Input value={f.category ?? ""} onChange={(e) => set("category", e.target.value)} /></Field>
        <Field label="Contact person"><Input value={f.contact_person ?? ""} onChange={(e) => set("contact_person", e.target.value)} /></Field>
        <Field label="Phone"><Input value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="WhatsApp"><Input value={f.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
        <Field label="Email"><Input value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Website"><Input value={f.website ?? ""} onChange={(e) => set("website", e.target.value)} /></Field>
        <Field label="Address"><Input value={f.address ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="Nearby landmark"><Input value={f.nearby_landmark ?? ""} onChange={(e) => set("nearby_landmark", e.target.value)} /></Field>
        <Field label="City"><Input value={f.city ?? ""} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="State"><Input value={f.state ?? ""} onChange={(e) => set("state", e.target.value)} /></Field>
        <Field label="PIN code"><Input value={f.pin_code ?? ""} onChange={(e) => set("pin_code", e.target.value)} /></Field>
        <Field label="Google Maps URL"><Input value={f.google_maps_url ?? ""} onChange={(e) => set("google_maps_url", e.target.value)} /></Field>
        <Field label="Latitude"><Input type="number" value={f.latitude ?? ""} onChange={(e) => set("latitude", e.target.value === "" ? null : Number(e.target.value))} /></Field>
        <Field label="Longitude"><Input type="number" value={f.longitude ?? ""} onChange={(e) => set("longitude", e.target.value === "" ? null : Number(e.target.value))} /></Field>
        <Field label="Working days"><Input value={f.working_days ?? ""} onChange={(e) => set("working_days", e.target.value)} placeholder="Mon–Sat" /></Field>
        <Field label="Working hours"><Input value={f.working_hours ?? ""} onChange={(e) => set("working_hours", e.target.value)} placeholder="10:00 AM – 6:00 PM" /></Field>
        <Field label="Languages (comma separated)">
          <Input value={f.languages.join(", ")} onChange={(e) => set("languages", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
        </Field>
        <Field label="Logo URL"><Input value={f.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} /></Field>
        <Field label="Cover image URL"><Input value={f.cover_url ?? ""} onChange={(e) => set("cover_url", e.target.value)} /></Field>
        <div className="sm:col-span-2"><Field label="Description"><Textarea rows={3} value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field></div>
        <div className="sm:col-span-2"><Field label="Mission"><Textarea rows={3} value={f.mission ?? ""} onChange={(e) => set("mission", e.target.value)} /></Field></div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Switch id="em" checked={f.emergency_support} onCheckedChange={(v) => set("emergency_support", v)} />
          <Label htmlFor="em" className="text-sm">Emergency support available (24×7)</Label>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </div>
    </Panel>
  );
}

function ServicesForm({ ngo, onSaved }: { ngo: NgoRow; onSaved: () => void }) {
  const [selected, setSelected] = useState<string[]>(ngo.services);
  const [saving, setSaving] = useState(false);
  useEffect(() => setSelected(ngo.services), [ngo]);

  function toggle(s: string, v: boolean) {
    setSelected((prev) => (v ? [...prev, s] : prev.filter((x) => x !== s)));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("ngos").update({ services: selected }).eq("id", ngo.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Services updated");
    onSaved();
  }

  return (
    <Panel title="Services offered">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {NGO_SERVICE_OPTIONS.map((s) => (
          <label key={s} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
            <Checkbox checked={selected.includes(s)} onCheckedChange={(v) => toggle(s, !!v)} />
            <span>{s}</span>
          </label>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save services"}</Button>
      </div>
    </Panel>
  );
}

type Appt = { id: string; name: string; phone: string; email: string | null; preferred_date: string | null; preferred_time: string | null; message: string | null; status: string; created_at: string };

function AppointmentsList({ ngoId, rows, onChanged }: { ngoId: string; rows: Appt[]; onChanged: () => void }) {
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    onChanged();
  }
  return (
    <Panel title={`Appointments (${rows.length})`}>
      {rows.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No appointments yet" description="Citizen requests will appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((a) => (
            <li key={a.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-medium">{a.name} • <span className="text-muted-foreground">{a.phone}</span></p>
                <p className="text-xs text-muted-foreground">
                  {a.preferred_date ?? "any date"} {a.preferred_time ?? ""} {a.email ? `• ${a.email}` : ""}
                </p>
                {a.message && <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">{a.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "confirmed")}>Confirm</Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, "declined")}>Decline</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

type HelpRow = { id: string; name: string; phone: string; subject: string; message: string; status: string };

function HelpList({ ngoId, rows, onChanged }: { ngoId: string; rows: HelpRow[]; onChanged: () => void }) {
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("help_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    onChanged();
  }
  return (
    <Panel title={`Help requests (${rows.length})`}>
      {rows.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No help requests yet" description="Incoming citizen requests will appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((h) => (
            <li key={h.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <p className="text-sm font-semibold">{h.subject}</p>
                <p className="text-xs text-muted-foreground">{h.name} • {h.phone}</p>
                <p className="mt-1 text-sm text-muted-foreground">{h.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">{h.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => setStatus(h.id, "in_progress")}>In progress</Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(h.id, "resolved")}>Resolve</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

type GalleryItem = { id: string; image_url: string; caption: string | null };

function GalleryManager({ ngoId, rows, onChanged }: { ngoId: string; rows: GalleryItem[]; onChanged: () => void }) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  async function add() {
    if (!url.trim()) return;
    const { error } = await supabase.from("ngo_gallery").insert({ ngo_id: ngoId, image_url: url.trim(), caption: caption || null });
    if (error) return toast.error(error.message);
    setUrl(""); setCaption(""); onChanged();
  }
  async function remove(id: string) {
    const { error } = await supabase.from("ngo_gallery").delete().eq("id", id);
    if (error) return toast.error(error.message);
    onChanged();
  }

  return (
    <Panel title="Photo gallery">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input placeholder="Image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Input placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <Button onClick={add}><Plus className="mr-1 h-4 w-4" />Add</Button>
      </div>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Images} title="No photos yet" description="Add image URLs to build your gallery." />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((g) => (
            <div key={g.id} className="group relative overflow-hidden rounded-xl border border-border">
              <img src={g.image_url} alt={g.caption ?? ""} className="aspect-square w-full object-cover" />
              <button
                onClick={() => remove(g.id)}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function SettingsPanel({ ngo, onDeleted }: { ngo: NgoRow; onDeleted: () => void }) {
  async function del() {
    if (!confirm("Delete this NGO? This cannot be undone.")) return;
    const { error } = await supabase.from("ngos").delete().eq("id", ngo.id);
    if (error) return toast.error(error.message);
    toast.success("NGO deleted");
    onDeleted();
  }
  return (
    <div className="space-y-4">
      <Panel title="Public profile">
        <p className="text-sm text-muted-foreground">
          Your NGO profile is public at:
        </p>
        <a
          href={`/ngos/${ngo.slug}`}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          /ngos/{ngo.slug} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Panel>
      <Panel title="Danger zone">
        <p className="text-sm text-muted-foreground">Permanently delete this NGO and all related data.</p>
        <Button variant="destructive" className="mt-3" onClick={del}>
          <Trash2 className="mr-1 h-4 w-4" /> Delete NGO
        </Button>
      </Panel>
    </div>
  );
}
