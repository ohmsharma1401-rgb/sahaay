import { Link } from "@tanstack/react-router";
import { HeartHandshake, Facebook, Twitter, Instagram, Linkedin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-section">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <HeartHandshake className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">Sahay</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              A trusted network connecting people with verified NGOs and lawyers for
              legal and social support.
            </p>
            <div className="mt-5 flex gap-3 text-muted-foreground">
              <a href="#" aria-label="Facebook" className="hover:text-foreground"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link to="/find-support" className="hover:text-foreground">Find Support</Link></li>
              <li><Link to="/find-lawyers" className="hover:text-foreground">Find Lawyers</Link></li>
              <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link to="/faqs" className="hover:text-foreground">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Emergency Contacts</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Women Helpline · 1091</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Child Helpline · 1098</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Police · 112</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Cyber Crime · 1930</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms &amp; Conditions</a></li>
              <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Sahay. All rights reserved.</p>
          <p>Built with care to support communities.</p>
        </div>
      </div>
    </footer>
  );
}
