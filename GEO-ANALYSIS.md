# Final Notes GEO Analysis

Audit date: 2026-07-23

Target: https://www.finalnotes.page/

## 1. GEO Readiness Score: 84/100 live

The site is machine-readable and source-aware: important text is server-rendered, comic pages expose canonical URLs and citations, and `llms.txt`, RSS, and sitemap output share the same R2 catalogue. The audited crawler, entity, feed, redirect, citation, and responsive-image improvements are deployed. The score is capped by anonymous editorial ownership, limited independent brand signals, unverified AI citation share, and field performance data that remains unavailable.

## 2. Platform breakdown

| Platform | Live readiness | Main factor |
| --- | ---: | --- |
| Google AI Overviews / AI Mode | 83 | Strong indexability and text; concise metadata and corrected schema help, but ordinary ranking remains decisive |
| ChatGPT Search | 85 | OAI-SearchBot and ChatGPT-User access, canonical passages, `llms.txt`, and RSS |
| Perplexity | 83 | PerplexityBot access and citations are good; independent entity/community validation is weak |

These are readiness scores, not measured citation share. No DataForSEO/AI-mention connector was available, so the audit does not claim that any platform currently cites the brand.

## 3. AI Crawler Access Status

| Agent | Verified production policy | Purpose |
| --- | --- | --- |
| Googlebot | Allow | Search indexing |
| Bingbot | Allow | Search indexing |
| OAI-SearchBot | Allow | OpenAI search |
| ChatGPT-User | Allow | User-requested retrieval |
| Claude-SearchBot | Allow | Anthropic search |
| Claude-User | Allow | User-requested retrieval |
| PerplexityBot | Allow | Perplexity search |
| Google-Extended | Block | Gemini training/grounding control distinct from Google Search |
| GPTBot | Block | OpenAI model training |
| ClaudeBot | Block | Anthropic model training |
| CCBot, anthropic-ai, Bytespider, cohere-ai | Block | Training/data collection policy |

Production includes a Cloudflare-managed preamble plus application rules. The merged live file agrees with the zone's `search=yes`, `ai-train=no`, `use=reference` intent: search and user-fetch crawlers are allowed while training crawlers are blocked.

## 4. llms.txt Status

Status: **Present and strong.**

The live file is comprehensive, lists canonical routes and recent issues, provides citation guidance, and exposes exact authored passages. This pass adds the RSS feed and accurately distinguishes search/user-fetch bots from training crawlers.

`llms.txt` is a convenience surface, not a Google ranking requirement. Keep it generated from the same R2 catalogue so it cannot drift from the reader and sitemap.

## 5. Brand Mention Analysis

No confirmed independent Final Notes / Memento Mori Obituary Comics entity presence was found on Wikipedia or Wikidata, and searches did not establish meaningful Reddit, YouTube, or LinkedIn mentions. First-party site results dominated.

Recommendation: earn genuine mentions through editorial collaborations, educators/libraries, artists, and relevant communities. Do not create inauthentic posts or a Wikipedia page solely for SEO. The stronger long-term signal is notable work that independent sources choose to discuss.

## 6. Passage-Level Citability

The editorial contract targets self-contained 134–167-word passages.

| Current issue | Live passage length | Status |
| --- | ---: | --- |
| Ada Lovelace | 148 words | Meets contract; verified in reader, RSS, and `llms.txt` |
| Robert Louis Stevenson | 140 words | Meets contract |
| John Lewis | 136 words | Meets contract |

The publication validator rejects future passages outside the range and verifies exact public surfaces. A signed metadata-only workflow corrected the existing Ada R2 record without replacing its media or deploying a second Worker.

A strong passage should identify the person and work in the first sentence, state the documented mortality event, include two or three source-grounded facts, and end with the specific relationship between mortality and the work. It must stand alone without the images and avoid unsupported interpretation.

## 7. Server-Side Rendering Check

Status: **Pass.**

Homepage, resource, reader, sitemap, RSS, and `llms.txt` outputs are server-generated from the runtime catalogue. Canonicals, H1s, citation passages, source links, and JSON-LD are present in HTML responses rather than requiring client execution. Interactive archive cards add JavaScript cost, but the core discovery content remains available without it.

Local `next start` cannot render catalogue-dependent production routes without the bound R2 manifest; the optimized build succeeds and production currently renders those routes. Maintain an R2-shaped local fixture for future serialized endpoint tests.

## 8. Top 5 Highest-Impact Changes

1. Add visible, real editorial ownership plus a corrections/contact policy.
2. Measure field Core Web Vitals and tune responsive `sizes`, below-fold loading, and document caching from real results.
3. Publish uniquely useful source comparisons and earn authentic third-party discussion around them.
4. Add production-shaped serialized feed/sitemap tests and keep publication verification cross-surface.
5. Measure real AI citation presence and field Core Web Vitals instead of inferring either from technical readiness.

## 9. Schema Recommendations

Implemented locally:

- Preserve visible FAQs but remove ineligible `FAQPage` JSON-LD.
- Use `keywords` for textual topic arrays rather than invalid `about` strings.
- Remove unsupported resource dates and linkless breadcrumb nodes.
- Connect `WebPage.mainEntity` to the `ComicStory`; connect the story to the subject `Person`, publisher, creator, sources, images, and exact abstract.
- Include image dimensions and avoid false exact dates for approximate life years.
- Give the organization consistent alternate names, logo, subject expertise, and publishing-principles URL.

Next step: add real `Person` author/editor nodes only when those people are visibly named on the page. Do not add unsupported schema types or properties merely for AI systems.

## 10. Content Reformatting Suggestions

- **Future comic readers:** preserve the deployed Ada pattern: 134–167 self-contained words with an immediate subject definition, documented mortality context, two or more named-source facts, and restrained synthesis.
- **Resource introductions:** answer the page's primary question in the first 40–60 words, then use the existing H2 structure. Keep passages page-specific rather than repeating the same latest-comic blurbs across resources.
- **Story notes:** use complete-sentence framing for sentence-shaped mortality events; the generated fallback was corrected in this pass.
- **FAQ content:** keep the visible question/answer format for readers, but do not restore FAQ structured data for this publisher.
- **About/editorial method:** name accountable editors, explain source selection and corrections, and show a real update date when the page itself changes.

Current Google guidance is to prioritize unique, people-first content and sound Search fundamentals rather than GEO-specific markup or artificial chunking: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
