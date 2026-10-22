import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Search,
  MapPin,
  Users2,
  Scale,
  ShieldCheck,
  Baby,
  UserRoundCog,
  Home as HomeIcon,
  Laptop,
  HeartHandshake,
  Sparkles,
  Star,
  ChevronDown,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { NGOCard, type NGO } from "@/components/site/NGOCard";
import { LawyerCard, type Lawyer } from "@/components/site/LawyerCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const stats = [
  { value: "2,400+", label: "Verified NGOs" },
  { value: "5,800+", label: "Verified Lawyers" },
  { value: "48,000+", label: "People Helped" },
  { value: "12,300+", label: "Cases Resolved" },
];

const services = [
  { icon: Users2, title: "Family Counseling", desc: "Mediation and guidance for family disputes." },
  { icon: ShieldCheck, title: "Women's Rights", desc: "Support for safety, dignity and legal aid." },
  { icon: Scale, title: "Legal Aid", desc: "Free and low-cost legal representation." },
  { icon: HeartHandshake, title: "Domestic Violence", desc: "Confidential help, shelter and counseling." },
  { icon: Baby, title: "Child Protection", desc: "Advocacy and safeguarding for minors." },
  { icon: UserRoundCog, title: "Senior Citizen Support", desc: "Care, rights and elder-abuse response." },
  { icon: HomeIcon, title: "Property Disputes", desc: "Guidance on tenancy and inheritance." },
  { icon: Laptop, title: "Cyber Crime Guidance", desc: "Reporting, evidence and legal recourse." },
];

const steps = [
  { n: "01", title: "Choose your issue", desc: "Pick a category that best describes your need." },
  { n: "02", title: "Allow location", desc: "We'll surface options closest to you." },
  { n: "03", title: "Find nearby NGOs & lawyers", desc: "Browse verified organizations and professionals." },
  { n: "04", title: "Book an appointment", desc: "Reach out securely and get help quickly." },
];

const ngos: NGO[] = [
  { name: "Aashray Foundation", initials: "AF", location: "Mumbai, MH", category: "Women's Rights", services: ["Counseling", "Legal Aid", "Shelter"], verified: true },
  { name: "Ummeed Trust", initials: "UT", location: "Bengaluru, KA", category: "Child Protection", services: ["Advocacy", "Rehabilitation"], verified: true },
  { name: "Nyaya Sahayak", initials: "NS", location: "Delhi, DL", category: "Legal Aid", services: ["Free consultation", "Documentation"], verified: true },
];

const lawyers: Lawyer[] = [
  { name: "Adv. Meera Kapoor", initials: "MK", experience: "12 years", specialization: "Family & Divorce Law", location: "Pune, MH", verified: true },
  { name: "Adv. Rohan Iyer", initials: "RI", experience: "9 years", specialization: "Cyber Crime Law", location: "Hyderabad, TS", verified: true },
  { name: "Adv. Sana Qureshi", initials: "SQ", experience: "15 years", specialization: "Women's Rights & DV", location: "Jaipur, RJ", verified: true },
];

const testimonials = [
  { name: "Priya S.", role: "Citizen", quote: "Within a day I was connected with a legal aid NGO. Calm, respectful, and quick." },
  { name: "Adv. Rahul M.", role: "Lawyer", quote: "Sahay helps me reach people who actually need my expertise — the workflow is clean." },
  { name: "Ummeed Trust", role: "NGO Partner", quote: "Verification and outreach became far easier once we joined the platform." },
];

const faqs = [
  { q: "Is Sahay free to use?", a: "Yes. Discovering NGOs and lawyers on Sahay is completely free for citizens." },
  { q: "How are NGOs and lawyers verified?", a: "Every profile passes document checks and identity verification before going live." },
  { q: "Is my information kept confidential?", a: "Yes. Your details are shared only with the professional you choose to contact." },
  { q: "Can I register my NGO or law practice?", a: "Absolutely. Use the register flow and pick your role to submit for verification." },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent)]" />
        <div className="container-x pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Trusted by 48,000+ people
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Helping you find{" "}
                <span className="bg-gradient-to-r from-primary to-emerald bg-clip-text text-transparent">
                  trusted legal &amp; social support
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Connect with verified NGOs and lawyers near you and get help quickly —
                privately, respectfully, and on your terms.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/find-support">
                    Find help <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/auth/register" search={{ role: "citizen" }}>
                    Citizen Portal
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth/register" search={{ role: "ngo_owner" }}>Register NGO</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link to="/auth/register" search={{ role: "lawyer" }}>Register Lawyer</Link>
                </Button>
              </div>

              {/* Search card */}
              <div className="mt-10 rounded-2xl border border-border bg-card p-3 shadow-card">
                <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_auto]">
                  <div className="flex items-center gap-2 rounded-xl border border-border px-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="What issue do you need help with?"
                      className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border px-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Location"
                      className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button className="h-11">Search</Button>
                </div>
              </div>
            </div>

            {/* Illustration panel */}
            <div className="relative">
              <div className="relative aspect-[5/6] w-full overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/8 via-background to-emerald/10 p-6 shadow-card">
                <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,var(--color-foreground)_1px,transparent_0)] [background-size:22px_22px]" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium shadow-soft backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-emerald" /> Verified network
                  </div>
                  <div className="rounded-full bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-soft backdrop-blur">
                    Live nearby
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    { name: "Aashray Foundation", tag: "Women's Rights", km: "1.2 km" },
                    { name: "Adv. Meera Kapoor", tag: "Family Law · 12 yrs", km: "2.4 km" },
                    { name: "Ummeed Trust", tag: "Child Protection", km: "3.1 km" },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-3 rounded-2xl border border-border bg-background/90 p-3 shadow-soft backdrop-blur">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.tag}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{c.km}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-background/95 p-4 shadow-soft backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Response time</p>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-2xl font-bold">~ 3.5 hrs</p>
                    <span className="rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-semibold text-emerald">
                      Fast
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-section">
        <div className="container-x grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <p className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <Section
        eyebrow="What we cover"
        title="Support across the issues that matter most"
        subtitle="From family matters to cyber safety — find people trained to help."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section
        eyebrow="How it works"
        title="Get to the right help in four calm steps"
        subtitle="No noise. No paperwork. Just clarity."
        muted
      >
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{step.n}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Featured NGOs */}
      <Section
        eyebrow="Featured NGOs"
        title="Verified organizations, ready to help"
        subtitle="A curated selection from across Sahay's growing network."
        action={
          <Button asChild variant="outline">
            <Link to="/find-support">Browse all NGOs</Link>
          </Button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ngos.map((n) => (
            <NGOCard key={n.name} ngo={n} />
          ))}
        </div>
      </Section>

      {/* Featured Lawyers */}
      <Section
        eyebrow="Featured lawyers"
        title="Experienced professionals near you"
        subtitle="Independent, verified, and rated by clients they've helped."
        muted
        action={
          <Button asChild variant="outline">
            <Link to="/find-lawyers">Browse all lawyers</Link>
          </Button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lawyers.map((l) => (
            <LawyerCard key={l.name} lawyer={l} />
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section
        eyebrow="Voices from Sahay"
        title="What people say"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* FAQs */}
      <Section
        eyebrow="FAQs"
        title="Frequently asked questions"
        subtitle="Quick answers to what people ask most."
        muted
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card px-6 py-2 shadow-soft">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-b last:border-b-0">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  <span className="flex-1">{f.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform" />
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* CTA */}
      <section className="container-x pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/85 p-10 text-primary-foreground shadow-card sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to find the right help?
              </h3>
              <p className="mt-2 max-w-xl text-primary-foreground/85">
                Join Sahay as a citizen, lawyer, or NGO owner — and start with a
                verified, respectful conversation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild size="lg" variant="secondary">
                <Link to="/auth/register" search={{ role: "citizen" }}>Citizen Portal</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  children,
  action,
  muted,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section className={muted ? "bg-section" : ""}>
      <div className="container-x py-20">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
