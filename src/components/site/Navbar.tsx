import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  HeartHandshake,
  User,
  Scale,
  Building2,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, dashboardPathForRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/find-support", label: "Find Support" },
  { to: "/find-lawyers", label: "Find Lawyers" },
  { to: "/about", label: "About" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, role } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        scrolled
          ? "border-b border-border/80 bg-background/85 backdrop-blur"
          : "bg-background",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Sahay</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {/* Quick link to Citizen Portal */}
          <Button asChild size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
            <Link to="/auth/login" search={{ role: "citizen" }}>
              <User className="mr-1.5 h-3.5 w-3.5" />
              Citizen Portal
            </Link>
          </Button>

          {/* Portals Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
                Portals <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Choose Dedicated Portal
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/auth/login" search={{ role: "citizen" }} className="cursor-pointer gap-2.5 py-2">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-xs">Citizen Portal</p>
                    <p className="text-[10px] text-muted-foreground">Find legal &amp; social help</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/auth/login" search={{ role: "lawyer" }} className="cursor-pointer gap-2.5 py-2">
                  <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-semibold text-xs">Lawyer Portal</p>
                    <p className="text-[10px] text-muted-foreground">Advocate consultations</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/auth/login" search={{ role: "ngo_owner" }} className="cursor-pointer gap-2.5 py-2">
                  <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-semibold text-xs">NGO Portal</p>
                    <p className="text-[10px] text-muted-foreground">Manage organization &amp; cases</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/auth/login" search={{ role: "admin" }} className="cursor-pointer gap-2.5 py-2">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-semibold text-xs">Admin Portal</p>
                    <p className="text-[10px] text-muted-foreground">Users &amp; logins monitoring</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <Button asChild size="sm">
              <Link to={dashboardPathForRole(role)}>
                {role === "admin" ? "Admin Console" : "Dashboard"}
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-md text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                activeProps={{ className: "text-foreground bg-muted" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-border pt-3">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Dedicated Portals
              </p>
              <div className="grid grid-cols-2 gap-2 px-2">
                <Link
                  to="/auth/login"
                  search={{ role: "citizen" }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs font-semibold hover:bg-muted"
                >
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  <span>Citizen Portal</span>
                </Link>
                <Link
                  to="/auth/login"
                  search={{ role: "lawyer" }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs font-semibold hover:bg-muted"
                >
                  <Scale className="h-3.5 w-3.5 text-purple-500" />
                  <span>Lawyer Portal</span>
                </Link>
                <Link
                  to="/auth/login"
                  search={{ role: "ngo_owner" }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs font-semibold hover:bg-muted"
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>NGO Portal</span>
                </Link>
                <Link
                  to="/auth/login"
                  search={{ role: "admin" }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs font-semibold hover:bg-muted"
                >
                  <Shield className="h-3.5 w-3.5 text-amber-500" />
                  <span>Admin Portal</span>
                </Link>
              </div>
            </div>

            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {user ? (
                <Button asChild className="flex-1" onClick={() => setOpen(false)}>
                  <Link to={dashboardPathForRole(role)}>
                    {role === "admin" ? "Admin Console" : "Dashboard"}
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                    <Link to="/auth/login">Login</Link>
                  </Button>
                  <Button asChild className="flex-1" onClick={() => setOpen(false)}>
                    <Link to="/auth/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
