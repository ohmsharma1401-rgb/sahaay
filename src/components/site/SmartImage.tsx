import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from "react";

/**
 * Default SVG placeholders served as inline data URIs so they never 404.
 * These are used as automatic fallbacks when a remote image fails to load.
 */
export const NGO_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#e6f4ee'/><stop offset='1' stop-color='#d5ecfb'/>
      </linearGradient></defs>
      <rect width='96' height='96' rx='16' fill='url(#g)'/>
      <path d='M48 22l22 12v10c0 14-9.5 24-22 28-12.5-4-22-14-22-28V34z' fill='#10b981' opacity='0.85'/>
      <path d='M42 50l5 5 10-12' stroke='white' stroke-width='3.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
    </svg>`,
  );

export const LAWYER_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#eef2ff'/><stop offset='1' stop-color='#e0f2fe'/>
      </linearGradient></defs>
      <rect width='96' height='96' rx='48' fill='url(#g)'/>
      <circle cx='48' cy='38' r='14' fill='#6366f1' opacity='0.85'/>
      <path d='M20 82c4-16 16-24 28-24s24 8 28 24' fill='#6366f1' opacity='0.85'/>
    </svg>`,
  );

export const COVER_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0' stop-color='#dcfce7'/><stop offset='0.5' stop-color='#e0f2fe'/><stop offset='1' stop-color='#ede9fe'/>
      </linearGradient></defs>
      <rect width='1200' height='400' fill='url(#g)'/>
    </svg>`,
  );

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackSrc: string;
  /** Optional node to render when there is no src at all (e.g. initials badge). */
  emptyFallback?: ReactNode;
};

/**
 * Image that automatically swaps to `fallbackSrc` if the primary URL fails
 * to load or is missing. Guarantees no broken image icons anywhere.
 */
export function SmartImage({ src, fallbackSrc, emptyFallback, alt = "", ...rest }: Props) {
  const initial = src && src.length > 0 ? src : fallbackSrc;
  const [current, setCurrent] = useState(initial);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setCurrent(src && src.length > 0 ? src : fallbackSrc);
    setErrored(false);
  }, [src, fallbackSrc]);

  if (!src && emptyFallback) return <>{emptyFallback}</>;

  return (
    <img
      {...rest}
      alt={alt}
      src={current}
      onError={() => {
        if (!errored) {
          setErrored(true);
          setCurrent(fallbackSrc);
        }
      }}
    />
  );
}
