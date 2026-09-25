import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Update `site` to the live domain before deploying so canonical tags,
// sitemap.xml and JSON-LD all resolve to real absolute URLs.
export default defineConfig({
  site: 'https://www.tmgplumbing.ie',
  integrations: [
    tailwind(),
    sitemap(),
  ],
});
