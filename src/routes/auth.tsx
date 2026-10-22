import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-primary/85 p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <Link to="/" className="relative flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Sahay</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            Trusted legal & social support, near you.
          </h2>
          <p className="mt-3 text-primary-foreground/85">
            Sahay connects people facing legal and social issues with verified NGOs
            and lawyers — respectfully and privately.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Dedicated Citizen, Lawyer & NGO portals",
              "Free & confidential for citizens",
              "Verified legal advocates & NGOs",
              "Direct case requests & appointments",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs font-bold">✓</span>
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/70">© {new Date().getFullYear()} Sahay</p>
      </aside>

      {/* Right form panel */}
      <main className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Sahay</span>
          </Link>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
