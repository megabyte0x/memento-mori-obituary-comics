# Final Notes SEO Audit

Audit date: 2026-07-23

Production target: https://www.finalnotes.page/

Business type: publisher / source-backed visual biography archive

Pre-deployment production baseline: **67/100**

Verified production score after deployment: **79/100**

The current score reflects Worker version `52a58ce5-c0d7-459e-8cda-f4bef9eebc1d`, deployed at 100% on 2026-07-23. Responsive delivery through the Cloudflare Workers Images binding is verified, but the score does not assume that field Core Web Vitals improved because no CrUX data or post-change Lighthouse baseline was available.

## Executive summary

Final Notes now has a verified crawlable foundation: all 68 live sitemap URLs return direct `200` responses, every HTML canonical matches, pages are server-rendered, the current reader includes a 148-word source-grounded passage, and RSS, sitemap, and `llms.txt` are generated from the same R2 catalogue. The visual archive also renders cleanly on desktop and mobile with low measured layout shift.

The most important remaining weaknesses are editorial authority and unmeasured field performance rather than indexability:

1. Named human authorship, corrections/contact policy, and independent brand/entity mentions remain weak.
2. Document HTML remains private/no-store pending a freshness-safe caching design for R2 publications.
3. Field LCP, INP, and CLS remain unverified; the pre-deployment mobile Lighthouse baseline failed LCP.

## Evidence and scope

- Live crawl of the homepage, current comic, resource pages, robots, sitemap, and `llms.txt`.
- Live status/canonical/noindex checks across all 68 sitemap URLs.
- Desktop and 375×812 mobile rendering checks of the homepage, research guide, and current reader.
- Source inspection of the Next.js/OpenNext application and R2 publication contract.
- Automated validation: 98 tests, `next build --webpack`, and the optimized OpenNext production build passed.
- Production verification: Cloudflare API confirmed the deployed Worker version at 100%; live RSS and sitemap XML parsed successfully; IndexNow accepted all 68 URLs.
- External brand/entity searches across Wikipedia/Wikidata, Reddit, YouTube, and LinkedIn result surfaces. No DataForSEO connector was available.

## Weighted scorecard

| Category | Weight | Current production | Main reason |
| --- | ---: | ---: | --- |
| Technical SEO | 25% | 85 | Healthy crawl coverage, one-hop HTTPS normalization, response headers, and valid discovery XML |
| Content quality | 25% | 76 | Strong sourcing and compliant current passage; anonymous editorial ownership remains |
| On-page SEO | 20% | 83 | Concise title/description templates and corrected heading source order |
| Structured data | 10% | 85 | Invalid/ineligible and misleading properties removed; entities connected |
| Performance / CWV | 10% | 50 | Responsive WebP delivery and self-hosted fonts reduce transfer risk, but baseline lab LCP fails and field data is unavailable |
| Images | 5% | 88 | Dimensions, 306 sitemap image entries, responsive `srcset`, and verified Workers Images transformations are live |
| AI search readiness | 5% | 84 | Crawler intent, a 148-word citation passage, RSS, and entity schema are live |

## Current search architecture

```text
R2 catalog/comics.json
        |
        v
loadRuntimeComics()
        |
        +--> homepage archive and resource story bridges
        +--> /comics/[slug]/ reader + JSON-LD
        +--> /sitemap.xml + comic image URLs
        +--> /llms.txt + exact citation passages
        +--> /feed.xml + newest 20 comics
```

The same R2 catalogue drives reader discovery, sitemap dates, AI-facing passages, and feed output. That makes the publication validator the correct place to enforce metadata quality before the manifest is updated.

## What is working now

- All 68 production sitemap URLs returned `200`, matched their canonical, and were indexable.
- Every sitemap HTML URL was found through internal links.
- The current comic has one H1, a canonical, a visible citation passage, source links, and `ComicStory`-shaped JSON-LD.
- `robots.txt` points to the canonical sitemap.
- `llms.txt` is substantial, includes canonical URLs and citation guidance, and exposes exact authored passages.
- Server-rendered HTML carries the important text; discovery does not depend on client-side JavaScript.
- Desktop CLS measured 0.009–0.020 and mobile CLS measured 0 on the three sampled templates.
- No sampled viewport showed horizontal overflow or broken above-the-fold media.

## Performance evidence

PageSpeed Insights was quota-blocked with HTTP 429 and no CrUX key was configured, so 75th-percentile field LCP, INP, and CLS are **unverified**. Three cold Lighthouse 13 mobile runs per page produced these medians:

| Template | Score | LCP | FCP | TBT | CLS | Payload |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage | 72 | 5.49s fail | 3.42s | 20ms | 0 | 1.35MB |
| Ada reader | 65 | 7.87s fail | 3.54s | 9ms | 0 | 1.61MB |

INP cannot be measured in a navigation lab run. Very low TBT suggests low interaction risk, but it is not an INP pass. The Google Fonts CSS import has been replaced with framework-hosted WOFF2 assets. Responsive comic delivery now uses a Workers Images binding and immutable WebP responses: a sampled 384px Ada page was 39,478 bytes versus the 261,187-byte original JPEG, an 84.9% reduction. The lab baseline has not been rerun, so no LCP gain is claimed. Remaining opportunities include stricter below-fold fetching, smaller client-island payloads, and a freshness-safe HTML cache; document HTML remains private/no-store.

## Changes implemented in this worktree

### Publication quality contract

- New comic publication now fails before the R2 manifest write unless it has:
  - a 134–167-word authored `citation_passage`;
  - one non-empty summary per comic page;
  - at least one HTTPS entity URL in `sameAs`;
  - named HTTPS sources;
  - a real `YYYY-MM-DD` publication date;
  - XML-safe asset paths.
- The post-publish verifier checks the reader, homepage, sitemap, and `llms.txt` for the exact canonical URL and authored passage.
- Generated story-note fallbacks now remain grammatical when the source fields are complete sentences.

### Discovery and crawler policy

- Added `/feed.xml`, advertising the 20 newest issues with canonical links, publication dates, citation copy, and cover media.
- Added RSS autodiscovery in the document head and listed the feed in `llms.txt`.
- Removed ignored `priority` and `changefreq` sitemap fields.
- Stopped assigning today's date to unchanged static URLs; comic pages use their own dates and changing collection pages use the latest issue date.
- Added comic page images to sitemap entries.
- Separated search/user-fetch bots from training bots in app `robots.txt`: OAI Search, ChatGPT User, Claude Search, Claude User, and Perplexity remain allowed; GPTBot, ClaudeBot, Google-Extended, Common Crawl, and other training-oriented crawlers are blocked.

### On-page and structured data

- Shortened the global brand suffix and generated comic titles/descriptions to search-friendly limits.
- Removed FAQ JSON-LD while preserving the visible FAQ. Google restricts FAQ rich results to authoritative government and health sites.
- Removed linkless middle breadcrumb items and changed resource schema arrays from invalid `about` strings to `keywords`.
- Removed misleading resource `datePublished`/`dateModified` fields that were neither page-specific nor visibly supported.
- Connected `WebPage`, `ComicStory`, `Person`, publisher, image, author/creator, dates, and citable summary nodes more precisely.
- Avoided converting an approximate birth year into a false exact `birthDate`.
- Replaced pre-H1 sidebar heading tags with non-heading labels without changing their presentation.

### Transport and response hygiene

- Canonical-host logic now forces HTTP production requests to HTTPS as well as apex-to-`www` normalization.
- Disabled the `x-powered-by` response header.
- Added `nosniff`, strict-origin referrer policy, camera/microphone/geolocation restrictions, and same-origin framing headers.
- Replaced the render-blocking Google Fonts stylesheet with self-hosted Next font assets.
- Added a signed metadata-only publication path for correcting R2-resident comics without re-uploading media or deploying a Worker.

## Remaining issues

### High priority

1. **Add accountable editorial identity.** Name the author/editor where appropriate and add a visible contact/corrections policy. Do not invent a person merely to satisfy schema.

### Medium priority

- Revisit private/no-store HTML caching with a short CDN freshness window compatible with R2 publication updates.
- Strictly defer below-fold reader pages/cards with reserved aspect-ratio placeholders so only the first reader page is fetched initially.
- Pass minimal archive-card props to client islands instead of serializing full comic records for all 41 production cards.
- Raise mobile reader toolbar targets (currently about 30–43px high), global navigation targets, and closely grouped source links toward 44–48px without disturbing reading flow.
- Wire IndexNow into the successful publication path as best-effort notification, not as a condition for publishing.
- Add a serialized XML integration test using an R2-shaped 41-comic fixture; object-level tests currently use the 34-comic repository seed.

## Production verification completed

- HTTP `www` redirects directly to HTTPS, and HTTPS apex redirects directly to the canonical `www` URL.
- Fresh production HTML omits `x-powered-by` and includes `nosniff`, strict-origin referrer policy, permissions policy, and same-origin framing headers.
- `/feed.xml` returns valid RSS XML with Ada Lovelace as the latest item.
- `/sitemap.xml` is valid XML with 68 URLs and 306 image entries; it contains no `priority` or `changefreq`.
- All 68 sitemap URLs returned `200`, followed no redirect, and all 68 HTML pages exposed the exact expected canonical.
- Cloudflare's managed robots preamble and application rules consistently allow search/user retrieval while blocking training crawlers.
- The exact 148-word Ada Lovelace citation passage appears unchanged in the reader, RSS, and `llms.txt`; ineligible FAQ schema and external Google Fonts markup are absent.
- Cloudflare API reports Worker version `52a58ce5-c0d7-459e-8cda-f4bef9eebc1d` receiving 100% of traffic.
- Responsive homepage and reader `srcset` candidates resolve through `/optimized-image/...`; a production probe returned `image/webp` with `X-Finalnotes-Image-Transform: images-binding` and immutable caching.
- The Browser-plugin acceptance pass loaded all seven Ada comic images from optimized URLs with nonzero dimensions, rendered the reader cleanly, and reported no console warnings or errors.
- IndexNow accepted the 68-URL submission with HTTP 200.

## Current guidance used

- Google says AI features require the same foundational SEO as Search and no special AI schema or AI text file: https://developers.google.com/search/docs/appearance/ai-features
- Google's 2026 AI-search guidance emphasizes unique, non-commodity, people-first content over GEO tricks: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google ignores sitemap `priority` and `changefreq` and uses `lastmod` only when it is accurate: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- OpenAI distinguishes OAI-SearchBot, GPTBot, and ChatGPT-User by purpose: https://developers.openai.com/api/docs/bots
- Anthropic distinguishes ClaudeBot, Claude-SearchBot, and Claude-User: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Cloudflare managed robots and Content Signals can prepend zone-level policy: https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/
- Cloudflare Workers can transform streamed R2 image bytes through an Images binding: https://developers.cloudflare.com/images/optimization/binding/
- Cloudflare Images bills unique transformations and documents the included/free-plan behavior: https://developers.cloudflare.com/images/pricing/
