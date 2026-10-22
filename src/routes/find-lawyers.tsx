import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, SlidersHorizontal, BadgeCheck, Star, IndianRupee, Briefcase } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/site/PageHero";
import { fetchLawyers, LAWYER_SPECIALIZATIONS, LAWYER_LANGUAGES, type LawyerRow } from "@/lib/lawyers";
import { StarRating } from "@/components/site/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { LAWYER_PLACEHOLDER, SmartImage } from "@/components/site/SmartImage";

export const Route = createFileRoute("/find-lawyers")({
  head: () => ({
    meta: [
      { title: "Find Lawyers — Sahay" },
      { name: "description", content: "Discover verified lawyers by specialization and location across India." },
      { property: "og:title", content: "Find Lawyers — Sahay" },
      { property: "og:description", content: "Discover verified lawyers by specialization and location." },
    ],
  }),
  component: FindLawyers,
});

const SORTS = ["Highest Rated", "Most Experienced", "Lowest Fee", "Nearest"] as const;
type Sort = (typeof SORTS)[number];

function FindLawyers() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState<string>("All");
  const [minExp, setMinExp] = useState(0);
  const [maxFee, setMaxFee] = useState<number | "">("");
  const [lang, setLang] = useState<string>("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("Highest Rated");

  const { data: lawyers = [], isLoading } = useQuery({ queryKey: ["lawyers"], queryFn: fetchLawyers });

  const { data: ratings = {} } = useQuery({
    queryKey: ["lawyer-ratings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("lawyer_id,rating").not("lawyer_id", "is", null);
      if (error) throw error;
      const map: Record<string, { sum: number; n: number }> = {};
      for (const r of data ?? []) {
        const id = r.lawyer_id as string;
        map[id] ??= { sum: 0, n: 0 };
        map[id].sum += r.rating;
        map[id].n += 1;
      }
      const out: Record<string, { avg: number; count: number }> = {};
      for (const [id, v] of Object.entries(map)) out[id] = { avg: v.sum / v.n, count: v.n };
      return out;
    },
  });

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const cityL = city.trim().toLowerCase();
    let rows = lawyers.filter((l) => {
      if (verifiedOnly && !l.verified) return false;
      if (ql && !`${l.full_name} ${l.qualification ?? ""} ${l.about ?? ""}`.toLowerCase().includes(ql)) return false;
      if (cityL && !(l.city ?? "").toLowerCase().includes(cityL)) return false;
      if (spec !== "All" && !l.specializations.includes(spec)) return false;
      if (lang !== "All" && !l.languages.includes(lang)) return false;
      if (minExp && l.experience_years < minExp) return false;
      if (maxFee !== "" && (l.consultation_fee ?? Infinity) > maxFee) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "Highest Rated") return (ratings[b.id]?.avg ?? 0) - (ratings[a.id]?.avg ?? 0);
      if (sort === "Most Experienced") return b.experience_years - a.experience_years;
      if (sort === "Lowest Fee") return (a.consultation_fee ?? Infinity) - (b.consultation_fee ?? Infinity);
      return 0;
    });
    return rows;
  }, [lawyers, q, city, spec, lang, minExp, maxFee, verifiedOnly, sort, ratings]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Find Lawyers"
        title="Experienced counsel, verified and near you"
        subtitle="Search by specialization, experience and location."
      />

      <section className="container-x relative z-10 -mt-8 pb-20">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_auto]">
            <div className="flex items-center gap-2 rounded-xl border border-border px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or specialization..." className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border px-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City or area" className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <Button className="h-11" onClick={() => { /* noop, live filter */ }}>Search</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Specialization:
            </span>
            {(["All", ...LAWYER_SPECIALIZATIONS] as string[]).map((c) => (
              <Badge
                key={c}
                variant={spec === c ? "default" : "secondary"}
                className="cursor-pointer rounded-full px-3 py-1"
                onClick={() => setSpec(c)}
              >
                {c}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Min exp</span>
              <input type="number" min={0} value={minExp || ""} onChange={(e) => setMinExp(Number(e.target.value) || 0)} className="h-8 w-16 rounded-md border border-border bg-transparent px-2 text-sm" />
              <span className="text-muted-foreground">yrs</span>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Max fee ₹</span>
              <input type="number" min={0} value={maxFee} onChange={(e) => setMaxFee(e.target.value === "" ? "" : Number(e.target.value))} className="h-8 w-20 rounded-md border border-border bg-transparent px-2 text-sm" />
            </label>
            <label className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Language</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="h-8 rounded-md border border-border bg-transparent px-2 text-sm">
                <option>All</option>
                {LAWYER_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
              <span className="text-muted-foreground">Verified only</span>
            </label>
            <label className="ml-auto flex items-center gap-1.5">
              <span className="text-muted-foreground">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-8 rounded-md border border-border bg-transparent px-2 text-sm">
                {SORTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${filtered.length} lawyer${filtered.length === 1 ? "" : "s"}`}
        </p>

        {!isLoading && lawyers.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No lawyers registered yet. If you're a lawyer, <Link to="/auth/register" search={{ role: "lawyer" }} className="font-semibold text-primary hover:underline">create an account</Link> to list your practice.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <LawyerDBCard key={l.id} lawyer={l} rating={ratings[l.id]} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function LawyerDBCard({ lawyer, rating }: { lawyer: LawyerRow; rating?: { avg: number; count: number } }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start gap-4">
        <SmartImage
          src={lawyer.photo_url}
          fallbackSrc={LAWYER_PLACEHOLDER}
          alt={lawyer.full_name}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold text-foreground">{lawyer.full_name}</h3>
            {lawyer.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lawyer.specializations[0] ?? lawyer.qualification ?? "Advocate"}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <StarRating value={rating?.avg ?? 0} size={12} />
            <span className="text-xs text-muted-foreground">{rating ? `${rating.avg.toFixed(1)} (${rating.count})` : "New"}</span>
          </div>
        </div>
      </div>

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{lawyer.experience_years} years experience</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{lawyer.city ?? "—"}</span>
        </div>
        {lawyer.consultation_fee != null && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-3.5 w-3.5" />
            <span>₹{lawyer.consultation_fee} per consultation</span>
          </div>
        )}
      </dl>

      <div className="mt-6 flex-1" />
      <div className="flex gap-2">
        <Button asChild className="flex-1"><Link to="/lawyers/$slug" params={{ slug: lawyer.slug }}>View profile</Link></Button>
      </div>
    </div>
  );
}
