/* ============================================================
 * Homepage asset manifest (Smartwood 2026 redesign)
 *
 * SINGLE SOURCE OF TRUTH for every image on the homepage. Swap a
 * placeholder by editing the `src` here — no need to touch page.tsx.
 *
 * Two ways to provide the real photography:
 *   1. Drop a file into /public/images/home/ and point `src` at the
 *      local path (e.g. '/images/home/hardware-hinge.jpg'). Easiest —
 *      replacing the file later needs no code change.
 *   2. Point `src` at a Supabase Storage URL (the current placeholders
 *      mostly use this — they're stand-ins pulled from existing product
 *      photography until the real marketing shots are shot).
 *
 * Each entry documents what the FINAL image should depict (`intent`) so
 * whoever supplies the real asset knows the brief. The `intent` field is
 * for humans only — it isn't rendered.
 * ============================================================ */

const SUPABASE = 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images';

export interface HomeAsset {
  src: string;
  /** What the final photograph should show. Documentation only. */
  intent: string;
}

export const HOME_ASSETS = {
  /** Hero — full-bleed image beside the "Built to last." headline. */
  hero: {
    src: '/images/home/hero-niche.png',
    intent: 'Hero: warmly-lit walnut display niche with LED strips, vase of flowers, coffee setup — matches the mockup.',
  } as HomeAsset,

  /** "Excellence in Every Detail" — tight hardware macro. */
  hardware: {
    src: '/images/home/hardware.png',
    intent: 'Excellence section: close-up of precision German hardware (pull-out rail mechanism). Mockup shows a chrome hinge macro.',
  } as HomeAsset,

  /** "Proudly Kuwaiti" heritage banner background (sits under a dark scrim). */
  factory: {
    src: '/images/home/feature-wide.png',
    intent: 'Heritage banner bg: the SmartWood workshop / factory floor with craftsmen at work. Wide landscape. Sits under a heavy espresso scrim so detail is secondary.',
  } as HomeAsset,
} as const;

/** "Designed for Living" category tiles. Order = display order, left→right. */
export const LIVING_TILES = [
  {
    key: 'custom',
    src: '/images/home/living-custom.png',
    enLabel: 'Custom Furniture',
    arLabel: 'أثاث مخصص',
    href: '/shop',
    intent: 'Custom built-in cabinetry.',
  },
  {
    key: 'wardrobes',
    src: '/images/home/living-wardrobes.png',
    enLabel: 'Wardrobes',
    arLabel: 'الدواليب',
    href: '/shop',
    intent: 'A walk-in wardrobe / closet interior.',
  },
  {
    key: 'dining',
    src: '/images/home/cat-dining.png',
    enLabel: 'Dining Sets',
    arLabel: 'طاولات الطعام',
    href: '/shop',
    intent: 'A dining table + chairs set in a styled room.',
  },
  {
    key: 'bedrooms',
    src: '/images/home/living-bedrooms.png',
    enLabel: 'Bedrooms',
    arLabel: 'غرف النوم',
    href: '/shop',
    intent: 'A dressing/vanity area with a bedroom feel.',
  },
] as const;
