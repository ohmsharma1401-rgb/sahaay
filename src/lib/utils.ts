import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Return a URL that is safe to use as a link `href`. Only allows http(s) URLs.
 * If the value is missing a scheme, prepend `https://`. Rejects `javascript:`,
 * `data:`, and other non-http schemes to prevent stored phishing/XSS via
 * user-supplied URLs (e.g. NGO/lawyer profile links).
 */
export function safeExternalHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
