import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — Sahay" },
      { name: "description", content: "Answers to common questions about using Sahay to find NGOs and lawyers." },
      { property: "og:title", content: "FAQs — Sahay" },
      { property: "og:description", content: "Answers to common questions about Sahay." },
    ],
  }),
  component: FaqsPage,
});

const faqs = [
  { q: "Is Sahay free to use?", a: "Yes — discovering NGOs and lawyers on Sahay is completely free for citizens." },
  { q: "How are NGOs and lawyers verified?", a: "Every listing passes document verification and identity checks before going live, and is reviewed periodically." },
  { q: "Is my information kept confidential?", a: "Your details are shared only with the professional you choose to contact." },
  { q: "Can I register my NGO or law practice?", a: "Yes. Use the register flow and pick the appropriate role — our team will guide you through verification." },
  { q: "Which cities do you cover?", a: "Sahay is being rolled out across major Indian cities and is expanding rapidly." },
  { q: "How do I report an issue with a listing?", a: "Use the Contact page or the report option on any profile. We investigate every report." },
  { q: "Do you handle emergencies?", a: "Sahay is not an emergency service. For urgent situations, please use the emergency helplines listed in the footer." },
];

function FaqsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="FAQs"
        title="Answers to common questions"
        subtitle="Everything you might want to know before getting started."
      />

      <section className="container-x py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card px-6 py-2 shadow-soft">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-b last:border-b-0">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
}
