import { BadgeCheck, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Lawyer = {
  name: string;
  initials: string;
  experience: string;
  specialization: string;
  location: string;
  verified?: boolean;
};

export function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/15 to-emerald/15 text-lg font-bold text-primary">
          {lawyer.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold text-foreground">{lawyer.name}</h3>
            {lawyer.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{lawyer.specialization}</p>
        </div>
      </div>

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{lawyer.experience} experience</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{lawyer.location}</span>
        </div>
      </dl>

      <div className="mt-6 flex-1" />
      <Button variant="outline" className="w-full">View profile</Button>
    </div>
  );
}
