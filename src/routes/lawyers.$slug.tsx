import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Languages,
  Clock,
  ExternalLink,
  Share2,
  Award,
  IndianRupee,
  Video,
  Building,
  ShieldAlert,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchLawyerBySlug, type LawyerRow } from "@/lib/lawyers";
import { fetchReviewsForLawyer, averageRating } from "@/lib/reviews";
import { StarRating } from "@/components/site/StarRating";
import { LAWYER_PLACEHOLDER, SmartImage } from "@/components/site/SmartImage";
import { BookLawyerDialog } from "@/components/site/BookLawyerDialog";
import { ReviewDialog } from "@/components/site/ReviewDialog";
import { toast } from "sonner";
import { safeExternalHref } from "@/lib/utils";

export const Route = createFileRoute("/lawyers/$slug")({
  loader: async ({ params }) => {
    const lawyer = await fetchLawyerBySlug(params.slug);
    if (!lawyer) throw notFound();
    return { lawyer };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.lawyer.full_name} — Sahay` },
          { name: "description", content: loaderData.lawyer.about ?? `Verified lawyer on Sahay.` },
        ]
      : [{ title: "Lawyer — Sahay" }],
  }),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-x py-20 text-center text-sm text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-bold">Lawyer not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The profile you're looking for doesn't exist.</p>
        <Button asChild className="mt-6"><Link to="/find-lawyers">Browse lawyers</Link></Button>
      </div>
    </SiteLayout>
  ),
  component: LawyerProfile,
});

function LawyerProfile() {
  const initial = Route.useLoaderData().lawyer;
  const qc = useQueryClient();
  const { data: lawyer = initial } = useQuery({
    queryKey: ["lawyer", initial.slug],
    queryFn: () => fetchLawyerBySlug(initial.slug).then((r) => r ?? initial),
    initialData: initial,
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["lawyer-reviews", initial.id],
    queryFn: () => fetchReviewsForLawyer(initial.id),
  });
  const { avg, count } = averageRating(reviews);

  const [bookOpen, setBookOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const location = [lawyer.office_address, lawyer.city].filter(Boolean).join(", ");
  const mapUrl =
    safeExternalHref(lawyer.google_maps_url) ||
    (lawyer.latitude != null && lawyer.longitude != null
      ? `https://www.google.com/maps?q=${lawyer.latitude},${lawyer.longitude}`
      : location
        ? `https://www.google.com/maps?q=${encodeURIComponent(location)}`
        : null);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: lawyer.full_name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied");
      }
    } catch {
      /* noop */
    }
  }

  return (
    <SiteLayout>
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-r from-primary/15 via-emerald/10 to-primary/10 sm:h-52" />

      <div className="container-x relative z-10 -mt-14 pb-16 sm:-mt-16">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-end">
          <SmartImage
            src={lawyer.photo_url}
            fallbackSrc={LAWYER_PLACEHOLDER}
            alt={lawyer.full_name}
            className="h-24 w-24 shrink-0 rounded-2xl border-4 border-background bg-card object-cover shadow-soft"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{lawyer.full_name}</h1>
              {lawyer.verified && (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1">
                  <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {lawyer.qualification ?? "Advocate"}
              {lawyer.experience_years ? ` • ${lawyer.experience_years} yrs experience` : ""}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <StarRating value={avg} />
                <span className="text-xs text-muted-foreground">{avg > 0 ? `${avg} (${count})` : "No reviews yet"}</span>
              </div>
              {lawyer.city && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {lawyer.city}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setBookOpen(true)}>Book appointment</Button>
            <Button variant="outline" onClick={() => setReviewOpen(true)}>Write review</Button>
            <Button variant="outline" size="icon" onClick={share} aria-label="Share">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            {lawyer.about && (
              <Section title="About">
                <p className="text-sm leading-relaxed text-muted-foreground">{lawyer.about}</p>
              </Section>
            )}
            {lawyer.specializations.length > 0 && (
              <Section title="Specializations">
                <div className="flex flex-wrap gap-2">
                  {lawyer.specializations.map((s: string) => (
                    <Badge key={s} variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/15">{s}</Badge>
                  ))}
                </div>
              </Section>
            )}
            <Section title="Qualifications">
              <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {lawyer.qualification && <li><b className="text-foreground">Degree: </b>{lawyer.qualification}</li>}
                {lawyer.university && <li><b className="text-foreground">University: </b>{lawyer.university}</li>}
                {lawyer.bar_number && <li><b className="text-foreground">Bar Council #: </b>{lawyer.bar_number}</li>}
                {lawyer.practice_since && <li><b className="text-foreground">Practicing since: </b>{lawyer.practice_since}</li>}
              </ul>
            </Section>
            {(lawyer.certificates.length > 0 || lawyer.achievements.length > 0) && (
              <Section title="Certificates & achievements">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {lawyer.certificates.map((c: string) => (
                    <li key={`c-${c}`} className="flex items-start gap-2"><Award className="mt-0.5 h-4 w-4 text-primary" />{c}</li>
                  ))}
                  {lawyer.achievements.map((c: string) => (
                    <li key={`a-${c}`} className="flex items-start gap-2"><Award className="mt-0.5 h-4 w-4 text-emerald" />{c}</li>
                  ))}
                </ul>
              </Section>
            )}
            <Section title="Location">
              <div className="grid h-56 place-items-center rounded-xl border border-dashed border-border bg-muted/30 text-center">
                <div>
                  <MapPin className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm">{location || "Address not provided"}</p>
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      Open in Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </Section>
            <Section title={`Reviews (${count})`}>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review.</p>
              ) : (
                <ul className="space-y-4">
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
            </Section>
          </div>

          <aside className="space-y-6">
            <Section title="Consultation">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {lawyer.consultation_fee != null && (
                  <InfoRow icon={IndianRupee} label={`₹${lawyer.consultation_fee} per consultation`} />
                )}
                {lawyer.available_days && <InfoRow icon={Clock} label={lawyer.available_days} />}
                {lawyer.available_time && <InfoRow icon={Clock} label={lawyer.available_time} />}
                <li className="flex flex-wrap gap-2 pt-1">
                  {lawyer.online_consultation && <Badge variant="secondary" className="rounded-full"><Video className="mr-1 h-3 w-3" />Online</Badge>}
                  {lawyer.offline_consultation && <Badge variant="secondary" className="rounded-full"><Building className="mr-1 h-3 w-3" />In-person</Badge>}
                  {lawyer.emergency_consultation && <Badge className="rounded-full bg-emerald/15 text-emerald hover:bg-emerald/20"><ShieldAlert className="mr-1 h-3 w-3" />Emergency</Badge>}
                </li>
              </ul>
            </Section>
            <Section title="Contact">
              <ul className="space-y-2 text-sm">
                {lawyer.phone && <InfoRow icon={Phone} label={lawyer.phone} href={`tel:${lawyer.phone}`} />}
                {lawyer.whatsapp && (
                  <InfoRow icon={MessageCircle} label={`WhatsApp ${lawyer.whatsapp}`} href={`https://wa.me/${lawyer.whatsapp.replace(/\D/g, "")}`} />
                )}
                {lawyer.email && <InfoRow icon={Mail} label={lawyer.email} href={`mailto:${lawyer.email}`} />}
              </ul>
            </Section>
            {lawyer.languages.length > 0 && (
              <Section title="Languages">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Languages className="h-4 w-4" /> {lawyer.languages.join(", ")}
                </p>
              </Section>
            )}
          </aside>
        </div>
      </div>

      <BookLawyerDialog lawyer={lawyer as LawyerRow} open={bookOpen} onOpenChange={setBookOpen} />
      <ReviewDialog
        target={{ kind: "lawyer", id: lawyer.id }}
        targetName={lawyer.full_name}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onSubmitted={() => qc.invalidateQueries({ queryKey: ["lawyer-reviews", initial.id] })}
      />
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfoRow({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href?: string }) {
  const inner = (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="truncate">{label}</span>
    </span>
  );
  return (
    <li>
      {href ? (
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="hover:text-foreground">
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}
