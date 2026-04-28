# extra.email — Location → Image Resolution

**Date:** 2026-04-23
**Analyst:** Kevin Patel
**Source:** CDN fingerprinting from live digest API response + reproduction via Serper.dev

---

## Summary

extra.email enriches calendar/event digest blocks with a venue photo (the `image_url` field in the digest API). The image is not sourced from Google Places, Apple Maps, Yelp, Foursquare, or TripAdvisor. The CDN fingerprint and a clean-room reproduction show the pipeline is almost certainly **Google Images / web-image search → take the top result's original URL**, served from whatever host ranks for the venue (often a local DMO website).

This is cheap, broadly covered, and — crucially — works for venues that Google Places does not have curated photos for.

---

## 1. The observation

In the digest API response for a calendar event at the Hiller Aviation Museum, the event block contained:

```json
"content": "Anvay's 5th Birthday @ Hiller Aviation Museum (601 Skyway Rd, San Carlos, CA 94070) on Sun May 3.",
"category": "events",
"image_url": "https://assets.simpleviewinc.com/simpleview/image/upload/crm/sanmateoca/Curtis-Pusher-Biplane---given-with-permission-by-Hiller-4-21-23---SMALLER_767F7B59-5056-A36A-0BF49CA985A1C872-767f783a5056a36_767f7f6d-5056-a36a-0b9eced616029b0a.jpg"
```

The same image does **not** appear in Google Maps or Google Places results for this venue — ruling out Google Places Photos as the source.

---

## 2. CDN fingerprint: what is `assets.simpleviewinc.com`?

| Attribute | Finding |
|---|---|
| **Operator** | Simpleview (a Granicus company) |
| **Product** | Simpleview DAM — Digital Asset Management, powered by Cloudinary under the hood |
| **Customers** | ~1,300+ tourism boards, CVBs, and DMOs (Destination Marketing Organizations) |
| **Path semantics** | `/crm/sanmateoca/` → San Mateo County CVB |
| **Host site** | `thesanfranciscopeninsula.com` (301 redirect from legacy `visitsanmateocounty.com`) |

**Implication:** The image is not served by a photo API product. It is a venue photo on the San Mateo County tourism bureau's CMS-hosted website, served through Simpleview's Cloudinary-backed CDN. extra.email is pulling a public image URL that ranks well in search for this venue.

---

## 3. Ruled-out sources (by CDN)

| Candidate API | Expected CDN pattern | Match? |
|---|---|---|
| Google Places Photos | `lh3.googleusercontent.com`, `maps.gstatic.com` | No |
| Yelp Fusion | `s3-media*.yelpcdn.com` | No |
| Foursquare Places | `fastly.4sqi.net`, `fsq-core-*` | No |
| TripAdvisor | `*.tacdn.com` | No |
| Apple Maps | No public photo API at all | No |

---

## 4. Hypothesis and reproduction

**Hypothesis:** extra.email queries an image-search API with the venue name + address and uses the top result's original URL.

**Reproduction:** A single call to Serper.dev (Google Images scrape) with the event's location string returns the same `assets.simpleviewinc.com/.../Curtis-Pusher-Biplane...` URL as the top result. Verified end-to-end on 2026-04-23.

```js
async function getLocationImage(location) {
  const res = await fetch('https://google.serper.dev/images', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: location, num: 5 }),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const top = data.images?.[0];
  if (!top) return null;
  return {
    imageUrl: top.imageUrl,
    thumbnailUrl: top.thumbnailUrl,
    title: top.title,
    source: top.source,
    sourceUrl: top.link,
    width: top.imageWidth,
    height: top.imageHeight,
  };
}
```

**Input:** `"Hiller Aviation Museum 601 Skyway Rd San Carlos CA 94070"`
**Top result `imageUrl`:** `https://assets.simpleviewinc.com/.../Curtis-Pusher-Biplane-....jpg` — matches the digest output.

---

## 5. Why this choice makes sense for extra.email

- **Broader coverage than Places Photos.** Google Places often has no curated photo for venues like private offices, conference rooms, or small tourist attractions. Image search almost always finds something.
- **Cheaper at scale.** Serper ≈ $0.30 / 1,000 queries vs. Google Places Photos at $7 / 1,000 (plus a required Place Details call at $5 / 1,000).
- **Higher fidelity for tourism-type venues.** DMO sites host owner-approved, SEO-optimized hero images that rank first in image search.
- **One call, address-native input.** No need to geocode first.

---

## 6. Tradeoffs and risks

| Risk | Detail |
|---|---|
| **Licensing ambiguity** | SERP-scraped URLs are not licensed imagery. Safe pattern is hotlink + attribution to `sourceUrl`, not rehost. |
| **Hotlink-blocking / 404s** | Some hosts block off-site hotlinking or rotate asset URLs. Pre-validate with a HEAD request before caching. |
| **Relevance drift** | Top image result for a generic query ("Starbucks Palo Alto") may be a stock brand logo, not the specific store. Address-level queries mitigate this. |
| **Freshness** | Cached SERP results can show outdated imagery (renovations, renamed venues). |
| **Terms of service** | Scraping Google SERPs directly violates Google ToS; using Serper/SerpAPI shifts that risk to the vendor. |

---

## 7. Alternative stacks that would produce the same behavior

| Stack | Cost / 1K | Notes |
|---|---|---|
| **Serper.dev** `/images` | ~$0.30 | Cheapest; used for reproduction above |
| **SerpAPI** `engine=google_images` | ~$5 (bundled with plan) | More robust + SLA |
| **Google Custom Search JSON API**, `searchType=image` | $5 (100/day free, cap 10K/day) | First-party, strict quota |
| **Azure "Grounding with Bing Search"** | ~$35 | Citations only, no raw image URLs — doesn't fit this pattern |

**Note:** The classic Bing Image Search API (`api.bing.microsoft.com/v7.0/images/search`) was retired on 2025-08-11 and is not a viable option.

---

## 8. Implications for Yahoo Mail Premium

### If we want to match this behavior
- A single SERP-image call per distinct event venue, cached by normalized location string, would fully reproduce extra.email's enrichment at low cost.
- Budget order of magnitude: ~$30 per 100K enrichments using Serper, before caching. With per-venue caching, real cost is dominated by unique venues, not unique events.

### Hybrid recommendation
1. Try **Google Places Photos** first when the location resolves to a `place_id` with photos — higher trust, licensed.
2. Fall back to **SERP image search** (Serper or Custom Search) when Places returns no photo.
3. Fall back to **Street View Static** for arbitrary addresses without venue identity.
4. Fall back to **static map with a pin** (Apple MapKit JS Snapshot is free up to 25K service calls/day) when nothing else works.

### Open questions
- Does extra.email apply content moderation / safe-search filtering on returned images?
- How does it handle ambiguous locations (e.g. `"Kevin's house"`)? Likely skips `image_url` — none observed in such blocks in the digest sample.
- Is the SERP call made at digest-generation time, or asynchronously post-hoc to avoid blocking the render? (The digest JSON schema suggests the former — image is inline.)

---

## Appendix: relevant fields in the digest API response

From `digest-api-reference.md` in this folder, every event / content block may carry:

| Field | Purpose |
|---|---|
| `image_url` | Hero image for the block — the field investigated here |
| `image_width` / `image_height` | Rendered dimensions; present when extra.email knows them (suggests a HEAD or image-probe step) |
| `sender_icon_url` | Unrelated — sender avatar, served from `storage.googleapis.com/extra-sender-images/` (first-party asset) |

The distinction matters: `sender_icon_url` is a first-party asset extra.email controls, while `image_url` is a third-party URL resolved per-content-block.
