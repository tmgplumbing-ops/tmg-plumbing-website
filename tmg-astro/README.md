# TMG Plumbing & Heating — website rebuild (Astro)

Scaffold for replacing the current Squarespace site, following
`TMG_Website_Redesign_Brief.docx` (design Option 3 — near-black + green,
"When it can't go wrong, call TMG.").

## Stack
- **Astro** — static-first, minimal JS, clean HTML for AI/search crawlers
- **Tailwind CSS** — utility styling, brand tokens in `tailwind.config.mjs`
- **Content collections** (`src/content/`) — typed Markdown for every
  service, commercial sector and local-SEO page, so pages stay structurally
  consistent as more are added
- **Vercel** (recommended) — `vercel` CLI or connect the git repo; zero config
  needed beyond the default Astro preset

## Run it
```
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
```

## Structure
```
src/
  content/
    services/       one .md per /services/[slug] page (7 core services)
    local-seo/       one .md per service+county page (e.g. power-flushing-waterford)
    commercial/       one .md per /commercial/[sector] page
    config.ts        shared schema — services and local-seo share one shape
  components/
    Nav.astro, Footer.astro   site chrome
    Schema.astro              LocalBusiness / Service / FAQPage JSON-LD
    ServicePageBody.astro     the two-column service template from the brief
  pages/
    index.astro                homepage
    services/[slug].astro      renders every entry in content/services
    commercial/index.astro     sector grid
    commercial/[slug].astro    renders every entry in content/commercial
    [...localSeoSlug].astro    renders every entry in content/local-seo at
                                its flat URL, canonical tag pointing at the
                                parent service page
    contact.astro
public/
  llms.txt      plain-language summary for AI crawlers/answer engines
  robots.txt
```

## What's built vs. what's left
Built and wired end-to-end: homepage, the service-page template (2 example
services populated), one commercial sector, one local-SEO page, contact page,
JSON-LD schema, canonical-tag handling, llms.txt.

Still to do, following the same pattern:
- Add a `.md` file per remaining service (5 more), commercial sector (5 more),
  and local-SEO page (brief specifies 6 to start, expanding to 15 —
  service × county combinations) — each is a content file, no new code
- About, Blog (needs a `blog` collection + index/[slug] routes), Pay, Products,
  Privacy policy, Terms — plain pages, no template needed
- Wire the quote form to a real backend (Formspree, Resend, or a serverless
  function) — must auto-reply to the enquirer and email
  info@tmgplumbing.ie per section 7 of the brief
- 301 redirect map from the old Squarespace URLs (add to `vercel.json` or
  host config once the URL list is exported)
- Real photography/logo assets in `public/images/` (currently unstyled —
  brief specifies no stock photos, illustrated backgrounds or solid blocks)
- Google Analytics 4 + Search Console verification before launch

## Interim content editing
Until a full CMS is worth the investment, service/local-SEO/commercial
content can be pulled at build time from a Zoho CRM custom module instead of
these `.md` files, so TMG staff can edit copy in the CRM they already use.
See the "Website Pages" module — once the empty module is created in Zoho
(Setup → Modules and Fields → Create New Module), ask Claude to wire up its
fields and a build-time fetch to replace the `content/` collections above.
