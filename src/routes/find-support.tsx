import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, SlidersHorizontal, LocateFixed, Map as MapIcon, LayoutGrid } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NGODataCard } from "@/components/site/NGOCard";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { fetchNgos, distanceKm, NGO_SERVICE_OPTIONS, type NgoRow } from "@/lib/ngos";
import { BookAppointmentDialog } from "@/components/site/BookAppointmentDialog";

export const Route = createFileRoute("/find-support")({
  head: () => ({
    meta: [
      { title: "Find Support — Sahay" },
      { name: "description", content: "Search verified NGOs near you by service, location and distance." },
      { property: "og:title", content: "Find Support — Sahay" },
      { property: "og:description", content: "Verified NGOs near you across many categories." },
    ],
  }),
  component: FindSupport,
});

type Sort = "nearest" | "rated" | "recent";

function FindSupport() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [service, setService] = useState<string>("all");
  const [distance, setDistance] = useState<string>("any");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sort, setSort] = useState<Sort>("recent");
  const [view, setView] = useState<"cards" | "map">("cards");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [bookNgo, setBookNgo] = useState<NgoRow | null>(null);

  const { data: ngos = [], isLoading } = useQuery({
    queryKey: ["ngos"],
    queryFn: fetchNgos,
    staleTime: 60_000,
  });

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSort("nearest");
        toast.success("Location detected");
      },
      (err) => toast.error(err.message || "Unable to fetch location"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const cityQ = city.trim().toLowerCase();
    let list = ngos.map((n) => {
      const d =
        coords && n.latitude != null && n.longitude != null
          ? distanceKm(coords, { lat: n.latitude, lng: n.longitude })
          : undefined;
      return { n, d };
    });

    if (verifiedOnly) list = list.filter(({ n }) => n.verified);
    if (query) {
      list = list.filter(({ n }) => {
        const hay = [n.name, n.category ?? "", n.city ?? "", ...(n.services ?? [])]
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
    }
    if (cityQ) list = list.filter(({ n }) => (n.city ?? "").toLowerCase().includes(cityQ));
    if (service !== "all")
      list = list.filter(({ n }) => n.services.some((s) => s.toLowerCase() === service.toLowerCase()));
    if (distance !== "any" && coords) {
      const max = Number(distance);
      list = list.filter(({ d }) => d != null && d <= max);
    }

    if (sort === "nearest" && coords) {
      list.sort((a, b) => (a.d ?? Infinity) - (b.d ?? Infinity));
    } else if (sort === "recent") {
      list.sort((a, b) => (a.n.created_at < b.n.created_at ? 1 : -1));
    } else if (sort === "rated") {
      // No ratings yet — surface verified first, then by name
      list.sort((a, b) => Number(b.n.verified) - Number(a.n.verified) || a.n.name.localeCompare(b.n.name));
    }
    return list;
  }, [ngos, q, city, service, distance, verifiedOnly, sort, coords]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Find Support"
        title="Verified NGOs, close to home"
        subtitle="Search by service and location. Allow location to see the nearest options first."
      />

      <section className="container-x relative z-10 -mt-8 pb-20">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_auto]">
            <div className="flex items-center gap-2 rounded-xl border border-border px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search NGO name, service, city..."
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border px-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City or area"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button className="h-11" onClick={requestLocation} variant={coords ? "outline" : "default"}>
              <LocateFixed className="mr-1.5 h-4 w-4" />
              {coords ? "Location on" : "Use my location"}
            </Button>
          </div>

          <div className="mt-4 grid gap-3 border-t border-border pt-4 lg:grid-cols-[auto_1fr_auto]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters:
              </span>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="h-9 w-[190px]"><SelectValue placeholder="Service" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {NGO_SERVICE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={distance} onValueChange={setDistance} disabled={!coords}>
                <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Distance" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any distance</SelectItem>
                  <SelectItem value="2">Within 2 km</SelectItem>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km</SelectItem>
                  <SelectItem value="25">Within 25 km</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1">
                <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                <Label htmlFor="verified-only" className="text-xs">Verified only</Label>
              </div>
            </div>
            <div />
            <div className="flex items-center justify-end gap-2">
              <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                <SelectTrigger className="h-9 w-[170px]"><SelectValue placeholder="Sort" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest" disabled={!coords}>Nearest first</SelectItem>
                  <SelectItem value="rated">Highest rated</SelectItem>
                  <SelectItem value="recent">Recently added</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex overflow-hidden rounded-lg border border-border">
                <button
                  onClick={() => setView("cards")}
                  className={`px-3 py-1.5 text-xs ${view === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`px-3 py-1.5 text-xs ${view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{filtered.length} organization{filtered.length === 1 ? "" : "s"}</p>
          {coords && (
            <Badge variant="secondary" className="rounded-full">Sorted by distance</Badge>
          )}
        </div>

        {view === "map" ? (
          <div className="mt-4 grid h-[420px] place-items-center rounded-2xl border border-dashed border-border bg-muted/30 text-center">
            <div>
              <MapIcon className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Map view coming soon</p>
              <p className="text-xs text-muted-foreground">A live map will render NGO pins here.</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-4 grid place-items-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <p className="text-sm font-medium">No NGOs match your filters</p>
            <p className="text-xs text-muted-foreground">Try clearing filters or a different search term.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ n, d }) => (
              <NGODataCard key={n.id} ngo={n} distanceKm={d} onBook={setBookNgo} />
            ))}
          </div>
        )}
      </section>

      <BookAppointmentDialog ngo={bookNgo} open={!!bookNgo} onOpenChange={(o) => !o && setBookNgo(null)} />
    </SiteLayout>
  );
}
