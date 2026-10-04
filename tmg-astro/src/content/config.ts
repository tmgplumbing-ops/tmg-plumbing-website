import { defineCollection, z } from 'astro:content';

// One shared shape for every service page (both the 7 core /services/*
// pages and every /[service]-[county] local SEO page reuse this schema,
// per the two-column template in section 5 of the redesign brief).
const serviceLike = z.object({
  title: z.string(),
  metaDescription: z.string().max(160),
  county: z.string().optional(), // set only on local SEO variants
  canonicalService: z.string().optional(), // slug of the parent /services/ page, for canonical tag
  heroSubheading: z.string(),
  intro: z.string(), // first paragraph — must contain service + location per SEO notes
  signs: z.array(z.string()), // "Signs you need this service"
  steps: z.array(z.object({ title: z.string(), body: z.string() })), // "How we do it"
  benefits: z.array(z.string()),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })),
  relatedServices: z.array(z.string()).default([]), // slugs into `services` collection
  // Optional richer blocks (added Oct 2026 for the full content rewrite).
  seoTitle: z.string().optional(), // page <title> when it should differ from "<title> | TMG Plumbing & Heating"
  h1: z.string().optional(), // on-page H1 when it should differ from `title`
  signsHeading: z.string().optional(),
  stepsHeading: z.string().optional(),
  benefitsHeading: z.string().optional(),
  about: z.object({ heading: z.string(), paragraphs: z.array(z.string()) }).optional(),
  video: z.object({
    youtubeId: z.string().optional(), // empty = "video coming soon" placeholder
    title: z.string(),
    caption: z.string().optional(),
  }).optional(),
  cost: z.object({
    heading: z.string(),
    intro: z.string(),
    factors: z.array(z.object({ title: z.string(), body: z.string() })),
    note: z.string().optional(),
  }).optional(),
  sections: z.array(z.object({
    heading: z.string(),
    paragraphs: z.array(z.string()).default([]),
    points: z.array(z.string()).optional(),
  })).optional(),
  areas: z.object({ heading: z.string(), intro: z.string().optional(), towns: z.array(z.string()) }).optional(),
  downloads: z.array(z.object({ label: z.string(), href: z.string(), meta: z.string().optional() })).optional(),
  reading: z.array(z.object({ title: z.string(), href: z.string() })).optional(),
  diagrams: z.array(z.string()).optional(), // keys: flush, flushProcess, ufh, ufhFlush, leak, leakSigns, demin, hwr, oil, heating, drinking
});

// Commercial sector pages share the service-page shape (Oct 2026 content rewrite).
const commercialSector = serviceLike;

const blogPost = z.object({
  title: z.string(), // on-page H1
  // Page <title> when it differs from the H1. Posts migrated from the old
  // Squarespace site keep their original title here to protect rankings.
  seoTitle: z.string().optional(),
  // No length cap: migrated posts keep their original descriptions verbatim,
  // even where they run past Google's ~160-character display limit.
  metaDescription: z.string(),
  publishDate: z.date(),
  excerpt: z.string(),
});

export const collections = {
  services: defineCollection({ type: 'content', schema: serviceLike }),
  'local-seo': defineCollection({ type: 'content', schema: serviceLike }),
  commercial: defineCollection({ type: 'content', schema: commercialSector }),
  blog: defineCollection({ type: 'content', schema: blogPost }),
};
