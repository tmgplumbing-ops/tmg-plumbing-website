// Pulls published content from the Zoho CRM "Website Pages" custom module
// and writes it into the repo as build inputs:
//   - Blog Post   -> src/content/blog/<slug>.md   (picked up by the `blog` collection)
//   - Service Page -> src/data/service-notices.json  (staff notices shown on /services/<slug>)
//   - Banner      -> src/data/banner.json          (site-wide announcement strip)
//
// Runs automatically before `astro build` (see package.json). If the Zoho
// credentials aren't set (e.g. a local dev build), it logs a warning and
// leaves whatever content/data files already exist untouched, rather than
// failing the build.
//
// Required env vars (set on Vercel):
//   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
//
// Zoho account is on the EU data center: accounts.zoho.eu / www.zohoapis.eu.

import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const DATA_DIR = path.join(ROOT, 'src/data');

const ACCOUNTS_DOMAIN = 'https://accounts.zoho.eu';
const API_DOMAIN = 'https://www.zohoapis.eu';
const MODULE = 'Website_Pages';
const FIELDS = [
  'Name',
  'Page_Type',
  'Slug',
  'Body',
  'Status',
  'Publish_Date',
  'Excerpt',
  'SEO_Description',
  'Target_Page',
  'Banner_Enabled',
  'Banner_Link_URL',
  'Banner_Start_Date',
  'Banner_End_Date',
  'Modified_Time',
].join(',');

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
async function getAccessToken() {
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = process.env;
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    return null;
  }
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    refresh_token: ZOHO_REFRESH_TOKEN,
  });
  const res = await fetch(`${ACCOUNTS_DOMAIN}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const json = await res.json();
  if (!json.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

async function fetchAllRecords(accessToken) {
  const records = [];
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const url = `${API_DOMAIN}/crm/v8/${MODULE}?fields=${FIELDS}&per_page=200&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    });
    if (res.status === 204) break; // no more records
    const json = await res.json();
    if (!res.ok) {
      throw new Error(`Zoho fetch failed (page ${page}): ${JSON.stringify(json)}`);
    }
    records.push(...(json.data ?? []));
    if (!json.info?.more_records) break;
    page += 1;
  }
  return records;
}

function isPublished(record) {
  return record.Status === 'Published';
}
const SYNC_MANIFEST = path.join(DATA_DIR, '.zoho-blog-manifest.json');

async function writeBlogPosts(records) {
  await mkdir(BLOG_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });

  // Remove files written by a previous sync (tracked in a manifest, since
  // the filenames themselves need to stay clean "<slug>.md" — Astro derives
  // each post's URL slug from the filename) so a record that's
  // unpublished/deleted in Zoho disappears from the site too. Any
  // hand-written posts left in the folder are never touched.
  const previousFiles = await readFile(SYNC_MANIFEST, 'utf8')
    .then((s) => JSON.parse(s))
    .catch(() => []);
  for (const file of previousFiles) {
    await rm(path.join(BLOG_DIR, file), { force: true });
  }

  const posts = records.filter((r) => r.Page_Type === 'Blog Post' && isPublished(r));
  const writtenFiles = [];
  for (const post of posts) {
    const slug = post.Slug?.trim() || slugify(post.Name);
    const publishDate = post.Publish_Date || new Date().toISOString().slice(0, 10);
    const frontmatter = [
      '---',
      `title: ${JSON.stringify(post.Name ?? '')}`,
      `metaDescription: ${JSON.stringify((post.SEO_Description || post.Excerpt || '').slice(0, 160))}`,
      `publishDate: ${publishDate}`,
      `excerpt: ${JSON.stringify(post.Excerpt ?? '')}`,
      '---',
      '',
    ].join('\n');
    const body = post.Body ?? '';
    const filename = `${slug}.md`;
    await writeFile(path.join(BLOG_DIR, filename), frontmatter + body + '\n', 'utf8');
    writtenFiles.push(filename);
  }
  await writeFile(SYNC_MANIFEST, JSON.stringify(writtenFiles, null, 2), 'utf8');
  console.log(`[sync-zoho] wrote ${posts.length} blog post(s)`);
}
async function writeServiceNotices(records) {
  await mkdir(DATA_DIR, { recursive: true });
  const notices = {};
  for (const r of records) {
    if (r.Page_Type !== 'Service Page' || !isPublished(r) || !r.Target_Page) continue;
    notices[r.Target_Page] = {
      body: r.Body ?? '',
      updated: r.Modified_Time ?? null,
    };
  }
  await writeFile(path.join(DATA_DIR, 'service-notices.json'), JSON.stringify(notices, null, 2), 'utf8');
  console.log(`[sync-zoho] wrote ${Object.keys(notices).length} service notice(s)`);
}

async function writeBanner(records) {
  await mkdir(DATA_DIR, { recursive: true });
  const banner = records.find((r) => r.Page_Type === 'Banner' && isPublished(r) && r.Banner_Enabled);
  const data = banner
    ? {
        enabled: true,
        message: banner.Excerpt || banner.Body || '',
        linkUrl: banner.Banner_Link_URL || null,
        startDate: banner.Banner_Start_Date || null,
        endDate: banner.Banner_End_Date || null,
      }
    : { enabled: false };
  await writeFile(path.join(DATA_DIR, 'banner.json'), JSON.stringify(data, null, 2), 'utf8');
  console.log(`[sync-zoho] banner enabled: ${data.enabled}`);
}
async function main() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.warn(
      '[sync-zoho] ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN not set — ' +
        'skipping Zoho sync and building with existing content as-is.'
    );
    // Make sure banner/service-notices data files exist so imports don't fail.
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(path.join(DATA_DIR, 'banner.json'), JSON.stringify({ enabled: false }), {
      flag: 'wx',
    }).catch(() => {});
    await writeFile(path.join(DATA_DIR, 'service-notices.json'), JSON.stringify({}), {
      flag: 'wx',
    }).catch(() => {});
    return;
  }

  const records = await fetchAllRecords(accessToken);
  console.log(`[sync-zoho] fetched ${records.length} record(s) from ${MODULE}`);

  await writeBlogPosts(records);
  await writeServiceNotices(records);
  await writeBanner(records);
}

main().catch((err) => {
  console.error('[sync-zoho] FAILED:', err);
  // Don't take the whole site down if Zoho is unreachable — build with
  // whatever content is already in the repo from the last successful sync.
  process.exit(0);
});
