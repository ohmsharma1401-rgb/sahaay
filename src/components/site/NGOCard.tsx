import { BadgeCheck, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type NgoRow } from "@/lib/ngos";
import { NGO_PLACEHOLDER, SmartImage } from "@/components/site/SmartImage";

/** Back-compat shape used by landing/showcase sections */
export type NGO = {
  name: string;
  initials: string;
  location: string;
  category: string;
  services: string[];
  verified?: boolean;
};

function LogoBadge({ url, name }: { url?: string | null; name: string }) {
  return (
    <SmartImage
      src={url}
      fallbackSrc={NGO_PLACEHOLDER}
      alt={`${name} logo`}
      className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover bg-background"
    />
  );
}

/** Simple presentational card used on the landing page */
export function NGOCard({ ngo }: { ngo: NGO }) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-base font-bold text-primary">
          {ngo.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold text-foreground">{ngo.name}</h3>
            {ngo.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {ngo.location}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Badge variant="secondary" className="rounded-full bg-emerald/10 text-emerald hover:bg-emerald/15">
          {ngo.category}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ngo.services.slice(0, 3).map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-6 flex-1" />
      <Button variant="outline" className="w-full">View profile</Button>
    </div>
  );
}

/** Rich card used on Find Support and listings */
export function NGODataCard({
  ngo,
  distanceKm,
  onBook,
}: {
  ngo: NgoRow;
  distanceKm?: number;
  onBook?: (ngo: NgoRow) => void;
}) {
  const location = [ngo.city, ngo.state].filter(Boolean).join(", ");
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start gap-4">
        <LogoBadge url={ngo.logo_url} name={ngo.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold text-foreground">{ngo.name}</h3>
            {ngo.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
          </div>
          {ngo.category && (
            <p className="mt-0.5 text-xs text-muted-foreground">{ngo.category}</p>
          )}
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{location || "—"}</span>
            {typeof distanceKm === "number" && (
              <span className="ml-1 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-medium text-emerald">
                {distanceKm.toFixed(1)} km
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
        {ngo.phone && (
          <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {ngo.phone}</p>
        )}
        {ngo.email && (
          <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3" /> {ngo.email}</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ngo.services.slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-6 flex-1" />
      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline">
          <Link to="/ngos/$slug" params={{ slug: ngo.slug }}>View profile</Link>
        </Button>
        <Button onClick={() => onBook?.(ngo)}>Book appointment</Button>
      </div>
    </div>
  );
}
