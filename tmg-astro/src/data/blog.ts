// Helpers for the blog: category, cover image, reading time and the matching
// service page for each post.
import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { photos } from './photos';

type Post = CollectionEntry<'blog'>;

export const CATEGORIES = [
  { name: 'Power flushing', service: { name: 'Power flushing', href: '/services/power-flushing' }, fallback: photos.flushMachine, fallbacks: [photos.flushMachine, photos.pipeBeforeAfter, photos.flushInProgress] },
  { name: 'Underfloor heating', service: { name: 'Underfloor heating', href: '/services/underfloor-heating' }, fallback: photos.ufhManifold },
  { name: 'Water treatment', service: { name: 'Water treatment', href: '/water-treatment' }, fallback: photos.deminUnit },
  { name: 'Oil heating', service: { name: 'Oil boiler installs', href: '/services/oil-boiler-installs' }, fallback: photos.oilBoiler },
  { name: 'Leak detection', service: { name: 'Leak detection', href: '/services/leak-detection' }, fallback: photos.thermalLeak },
  { name: 'Heat pumps', service: { name: 'Plumbing & heating', href: '/services/plumbing-heating' }, fallback: photos.plantManifolds },
  { name: 'Home heating tips', service: { name: 'Plumbing & heating', href: '/services/plumbing-heating' }, fallback: photos.plantCylinder },
] as const;
export type Category = (typeof CATEGORIES)[number];

const RULES: [RegExp, string][] = [
  [/underfloor/, 'Underfloor heating'],
  [/power-?flush|flushing|radiators-not-working/, 'Power flushing'],
  [/demineral|hard-water/, 'Water treatment'],
  [/oil/, 'Oil heating'],
  [/leak/, 'Leak detection'],
  [/heatpump|heat-pump/, 'Heat pumps'],
];

export function categoryOf(slug: string): Category {
  const name = RULES.find(([rx]) => rx.test(slug))?.[1] ?? 'Home heating tips';
  return CATEGORIES.find((c) => c.name === name)!;
}

const blogImages = import.meta.glob<{ default: ImageMetadata }>('../content/blog/images/*.webp', { eager: true });

// First image in the post body, if any. `leading` is true when the post opens
// with that image, so the page can hide it from the body and show it as the cover.
export function coverOf(post: Post): { src: ImageMetadata; alt: string; leading: boolean } {
  const m = post.body.match(/!\[([^\]]*)\]\(\.\/images\/([^)]+)\)/);
  const mod = m && blogImages[`../content/blog/images/${m[2]}`];
  if (m && mod) {
    const leading = post.body.trim().startsWith(m[0]);
    return { src: mod.default, alt: m[1], leading };
  }
  // Posts without their own photo get one from their category, varied by slug
  // so neighbouring cards don't all show the same picture.
  const cat = categoryOf(post.slug);
  const pool = 'fallbacks' in cat ? cat.fallbacks : [cat.fallback];
  const hash = [...post.slug].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const fb = pool[hash % pool.length];
  return { src: fb.src, alt: fb.alt, leading: false };
}

export function readingMinutes(post: Post): number {
  const words = post.body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export const formatDate = (d: Date) => d.toLocaleDateString('en-IE', { year: 'numeric', month: 'long', day: 'numeric' });
