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
});

const commercialSector = z.object({
  title: z.string(),
  metaDescription: z.string().max(160),
  intro: z.string(),
  points: z.array(z.string()),
});

const blogPost = z.object({
  title: z.string(),
  metaDescription: z.string().max(160),
  publishDate: z.date(),
  excerpt: z.string(),
});

export const collections = {
  services: defineCollection({ type: 'content', schema: serviceLike }),
  'local-seo': defineCollection({ type: 'content', schema: serviceLike }),
  commercial: defineCollection({ type: 'content', schema: commercialSector }),
  blog: defineCollection({ type: 'content', schema: blogPost }),
};
