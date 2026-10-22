import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sahay" },
      { name: "description", content: "Get in touch with the Sahay team for support, partnerships, or feedback." },
      { property: "og:title", content: "Contact — Sahay" },
      { property: "og:description", content: "Reach out to the Sahay team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="We'd love to hear from you" subtitle="Questions, feedback, or partnership ideas — send us a note." />

      <section className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <ContactItem icon={Mail} title="Email" value="hello@sahay.app" />
            <ContactItem icon={Phone} title="Phone" value="+91 98765 43210" />
            <ContactItem icon={MapPin} title="Address" value="Sahay HQ, Mumbai, India" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent — we'll get back to you soon.");
              (e.target as HTMLFormElement).reset();
            }}
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Your name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} placeholder="Tell us more..." required />
            </div>
            <Button type="submit" className="w-full sm:w-auto">Send message</Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function ContactItem({ icon: Icon, title, value }: { icon: typeof Mail; title: string; value: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
