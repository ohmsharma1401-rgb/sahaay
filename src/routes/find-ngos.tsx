import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/find-ngos")({
  beforeLoad: () => {
    throw redirect({ to: "/find-support" });
  },
  component: () => null,
});

// Legacy PageHero re-export for backwards compatibility.
export { PageHero } from "@/components/site/PageHero";
