# Final Notes SEO / GEO Action Plan

Updated: 2026-07-23

Target: https://www.finalnotes.page/

## Critical — completed through 2026-07-23

1. **Deployed and verified the audited worktree.**
   - Cloudflare Worker version `52a58ce5-c0d7-459e-8cda-f4bef9eebc1d` receives 100% of production traffic.
   - HTTP and apex requests normalize directly to canonical HTTPS `www` URLs.
   - Production headers omit `x-powered-by` and include the four baseline security policies.
   - RSS and sitemap parse as XML; the sitemap exposes 68 URLs and 306 images with no ignored priority/frequency fields.
   - All 68 sitemap URLs return direct `200` responses with exact canonicals.
   - The live Cloudflare robots preamble agrees with the application search-versus-training policy.
   - The Worker `IMAGES` binding serves responsive WebP candidates from private R2 media through `/optimized-image/...`.
   - A sampled 384px Ada page is 39,478 bytes versus the 261,187-byte original JPEG, an 84.9% reduction.
   - Browser acceptance loaded all seven Ada pages from optimized URLs with no console warnings or errors.

## High — next 7 days

1. **Make editorial accountability explicit.**
   - Add real author/editor names and short credentials if the publisher is comfortable doing so.
   - Add a visible corrections/contact policy on About.
   - Add `Person` schema only for real, visibly identified people.

## Medium — next 30 days

1. **Improve delivery without weakening publication freshness.**
   - Defer reader pages below page one with reserved aspect-ratio placeholders.
   - Pass minimal archive-card props into client islands instead of full comic records.
   - Test a short `s-maxage`/stale-while-revalidate policy for HTML generated from the R2 catalogue.
   - Preserve immediate correctness for newly published issue URLs.

2. **Improve mobile accessibility.**
   - Raise reader toolbar, global navigation, and source-link targets toward 44–48px.
   - Re-run the 375×812 visual pass and ensure the first comic image does not move materially farther down the viewport.

3. **Harden discovery tests.**
   - Serialize sitemap and RSS XML in integration tests.
   - Use a production-shaped 41-comic fixture with all R2-only assets.
   - Check XML namespaces, escaping, dates, URL count, and image count.

4. **Notify indexes after successful publication.**
   - Wire the existing IndexNow helper to run best-effort only after the manifest and public verification succeed.
   - Add Search Console and Bing Webmaster monitoring; Google introduced separate generative-AI performance reporting in 2026.

## Low — editorial growth backlog

1. Publish unique editorial material that cannot be synthesized from generic biographies: selection rationale, source comparisons, annotated panels, and corrections history.
2. Build authentic external discovery through relevant educators, librarians, artists, and mortality-studies communities. Do not manufacture Reddit, Wikipedia, LinkedIn, or YouTube mentions.
3. Consider a short video or audio treatment for selected comics and link it to the same canonical subject entity.
4. Evaluate RSL only after deciding the intended licensing policy; Cloudflare Content Signals already express `search=yes`, `ai-train=no`, and reference use at the zone layer.

## Completed and deployed in this pass

- Publication contract for passage length, page summaries, entity URLs, source URLs, valid dates, and XML-safe assets.
- Post-publish cross-surface verification.
- Accurate sitemap dates, removed ignored fields, and comic image discovery.
- RSS feed and head autodiscovery.
- Current-purpose search/user/training crawler policy.
- Concise search metadata.
- FAQ, breadcrumb, resource, comic, image, publisher, and Person schema corrections.
- Heading source-order correction with no presentation change.
- HTTP canonicalization and baseline response security headers.
- Framework-hosted WOFF2 fonts with no external Google Fonts stylesheet.
- Signed metadata-only corrections for existing R2 comics.
- Cloudflare Workers Images binding, validated `/optimized-image/...` routes, responsive `srcset` output, immutable WebP caching, and original-byte fallback.
- Ada Lovelace republished with a 148-word, source-grounded passage; exact text verified in the reader, RSS, and `llms.txt`.
- IndexNow accepted the live 68-URL inventory with HTTP 200.
- 98 passing tests, successful Next/OpenNext production builds, and live production verification.
