// Pulls the star rating, review count and latest reviews for TMG's Google
// Business Profile from the Google Places API (New) and writes them to
// src/data/google-reviews.json, which the home page reads at build time.
//
// Runs before `astro build` (see package.json). It never fails the build:
// if the key isn't set or Google can't be reached, it logs a warning and
// leaves the existing JSON file alone (the reviews section then shows
// whatever was last fetched, or just a link to Google if nothing has been).
//
// Env vars (set on Vercel, Production + Preview):
//   GOOGLE_PLACES_API_KEY  required. A Google Cloud API key with
//                          "Places API (New)" enabled.
//   GOOGLE_PLACE_ID        optional. If missing, the business is looked up
//                          by name and the ID is printed in the build log.

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../src/data/google-reviews.json');
const KEY = process.env.GOOGLE_PLACES_API_KEY;
const SEARCH = 'TMG Plumbing & Heating Services, Six Cross Roads Business Park, Waterford';

const log = (m) => console.log(`[google-reviews] ${m}`);

async function findPlaceId() {
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress' },
    body: JSON.stringify({ textQuery: SEARCH, regionCode: 'IE' }),
  });
  if (!r.ok) throw new Error(`searchText ${r.status}: ${await r.text()}`);
  const p = (await r.json()).places?.[0];
  if (!p) throw new Error('business not found by name; set GOOGLE_PLACE_ID');
  log(`found "${p.displayName?.text}" at ${p.formattedAddress}. Place ID: ${p.id} (add this as GOOGLE_PLACE_ID)`);
  return p.id;
}

async function main() {
  if (!KEY) { log('GOOGLE_PLACES_API_KEY not set; keeping existing reviews file.'); return; }
  const id = process.env.GOOGLE_PLACE_ID || (await findPlaceId());
  const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=en&regionCode=IE`, {
    headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'displayName,rating,userRatingCount,googleMapsUri,reviews' },
  });
  if (!r.ok) throw new Error(`place details ${r.status}: ${await r.text()}`);
  const p = await r.json();
  const reviews = (p.reviews ?? [])
    .filter((v) => (v.text?.text || v.originalText?.text) && v.rating >= 4)
    .map((v) => ({
      author: v.authorAttribution?.displayName ?? 'Google user',
      authorUri: v.authorAttribution?.uri ?? null,
      photoUri: v.authorAttribution?.photoUri ?? null,
      rating: v.rating,
      text: (v.text?.text || v.originalText?.text).trim(),
      when: v.relativePublishTimeDescription ?? '',
      reviewUri: v.googleMapsUri ?? null,
    }));
  const data = {
    fetchedAt: new Date().toISOString(),
    placeId: id,
    rating: p.rating ?? null,
    count: p.userRatingCount ?? null,
    mapsUri: p.googleMapsUri ?? null,
    writeReviewUri: `https://search.google.com/local/writereview?placeid=${id}`,
    reviews,
  };
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
  log(`saved rating ${data.rating} from ${data.count} reviews, ${reviews.length} shown.`);
}

main().catch((e) => log(`WARNING: ${e.message}. Keeping existing reviews file.`));
