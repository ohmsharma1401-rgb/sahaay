import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Target, Users, Heart, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Sahay" },
      { name: "description", content: "Sahay is a nationwide network connecting people with verified NGOs and lawyers for legal and social support." },
      { property: "og:title", content: "About — Sahay" },
      { property: "og:description", content: "Our mission is to make trusted help accessible to everyone." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Target, title: "Focused", desc: "One mission — trusted help, faster." },
  { icon: Users, title: "For everyone", desc: "Free for citizens, always." },
  { icon: Heart, title: "Human", desc: "Respectful, private, kind." },
  { icon: ShieldCheck, title: "Verified", desc: "Every partner checked and re-checked." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About Sahay"
        title="Building a trusted bridge between citizens and support"
        subtitle="We believe timely, dignified help changes lives. Sahay makes that help easy to find."
      />

      <section className="container-x py-20">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Sahay was born out of a simple observation: when people need help with legal or social
              matters, they often don't know where to turn. We wanted to change that — by curating a
              vetted network of NGOs and lawyers, and pairing it with a calm, respectful experience.
            </p>
            <p>
              Today, thousands of citizens use Sahay to find the right professional or organization for
              issues ranging from family counseling to cyber crime guidance. Every profile on the
              platform is verified, and our team works closely with partners to keep quality high.
            </p>
            <p>
              This is a college project in active development — a working prototype of what a
              nationwide, trustworthy support network could look like.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 self-start">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{v.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
