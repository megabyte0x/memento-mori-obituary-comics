# Off-Page Seeding Playbook — finalnotes.page

Why this matters: for a young domain, **brand mentions across platforms correlate
~3× more strongly with AI/search visibility than backlinks** (Ahrefs, Dec 2025).
On-page SEO is already strong and deployed; the remaining lever is getting the
brand named and entity-linked in places Google and AI engines trust
(Wikidata, Reddit, YouTube, Hacker News, niche newsletters).

**Rules of the road (do not skip):**
- Contribute value first. Every post must stand on its own even if no one clicks the link.
- One account, real identity, no sockpuppets, no upvote rings. Astroturfing gets the
  domain penalized and banned — the opposite of the goal.
- Respect each community's self-promotion ratio (Reddit ≈ 1 promo per ~9 genuine posts).
- Space submissions out. A burst of identical links across platforms looks like spam.

Priority order: **1) Wikidata → 2) Reddit → 3) Hacker News / Lobsters → 4) YouTube
→ 5) Substack Notes & directories.** Wikidata first because it is the entity
backbone the others reinforce.

---

## 1. Wikidata item (highest leverage, do first)

Wikidata is far more permissive than Wikipedia and is read directly by Google's
Knowledge Graph and by LLMs. Create an item for the publication.

1. Log in at https://www.wikidata.org → "Create a new Item".
2. **Label:** `Memento Mori Obituary Comics`
   **Description:** `web comic series of source-backed biographical obituary comics`
3. Add statements (Property → Value):
   - `instance of (P31)` → `webcomic (Q1004)` and `online publication (Q1110794)`
   - `official website (P856)` → `https://www.finalnotes.page`
   - `genre (P136)` → `biography (Q36279)`, `comics (Q1004)`
   - `country of origin (P495)` → as applicable
   - `inception (P571)` → first publication date
4. Add external IDs / sameAs where available: Substack URL, GitHub URL, YouTube
   channel (once created), X/Twitter (once created) via `described at URL (P973)`.
5. Once the item exists, add its URL to `SAME_AS_URLS` in `lib/site.js` so the
   site's Organization schema links back (closes the entity loop).

> Note on Wikipedia: a full **Wikipedia article** likely won't survive notability
> review yet (needs multiple independent, significant secondary sources). Don't
> waste effort there until press coverage exists. Wikidata has no such bar.

---

## 2. Reddit (strongest brand-mention signal for AI search)

Reddit is the #1 cited source for Perplexity and a top source for ChatGPT.
Post the **comic image** natively (Reddit rewards native media), tell the story
in the body, and link the source page once at the end.

**Target subreddits** (check each one's rules + self-promo policy first):
- r/comics, r/webcomics — native comic post
- r/HistoryMemes is wrong tone; use **r/history**, **r/Historyof…** niche subs for discussion (text, not the comic, to avoid self-promo flags)
- r/literature, r/books — for the writer subjects (Orwell, Dahl, Dostoevsky, Levi, Wiesel, Solzhenitsyn, Cervantes)
- r/Art, r/illustration — craft angle
- r/coolguides — the "obituary vs death notice / vs eulogy" comparison tables
- r/death, r/deathpositive — the mortality/memento-mori framing
- r/InternetIsBeautiful — the site as a whole (once polished)

**Example post (r/webcomics or r/comics)** — native image upload + this body:
> **Title:** I draw source-backed obituary comics about people who made their most important work while facing death. This one is Helen Keller at the water pump.
>
> **Body:** Each one focuses on the single moment mortality put pressure on a life — Keller losing sight and sound to a fever at 19 months, then language breaking through by touch in 1887. I keep the comic as the read but footnote every claim so it's checkable. Sources and the full set are here if anyone wants the rabbit hole: https://www.finalnotes.page/comics/helen-keller-water-pump/

**Example post (r/coolguides)** — upload the comparison table as an image:
> **Title:** The difference between an obituary, a death notice, and a funeral notice (made this while researching how to write one for my family)
> **Body:** Short version: death notice = announcement, obituary = life story, funeral notice = logistics. Fuller breakdown + cost/length differences: https://www.finalnotes.page/obituary-vs-death-notice/

Rotate subjects (16 comics = 16+ genuine posts over weeks). Never post the same
link to multiple subs the same day.

---

## 3. Hacker News + Lobsters (one shot, make it count)

The site is a clean, fast, schema-rich Next.js project with a distinctive concept —
good "Show HN" material.
- **Show HN title:** `Show HN: Obituary Comics – source-backed biographical comics about mortality`
- URL: `https://www.finalnotes.page`
- First comment (you post it): explain the editorial method, the source-footnoting,
  the static/SEO architecture, and ask for feedback. HN rewards builders who engage.
- Post Tue–Thu ~9am ET. Do **not** ask for upvotes anywhere.
- Cross-post to Lobsters if you have an invite.

---

## 4. YouTube (durable, strongest AI-citation correlation)

YouTube mentions show the single highest correlation (~0.737) with AI citations.
You don't have video yet — the cheapest path is **narrated slideshow Shorts** from
existing comic pages.

**Per-comic Short (45–60s) script template:**
> Hook (0–3s): "He wrote his most famous book while dying of TB." [show cover]
> Beats (3–45s): the mortality event → the work it produced → one verified detail. One comic page per beat.
> Close (45–60s): "Full story and sources at finalnotes dot page. New obituary comic most days."

**Title/description pattern (per video):**
- Title: `Why [Person] Made Their Greatest Work While Facing Death | Obituary Comics`
- Description (first line is what AI reads): `[Person] ([years]) — [one-sentence mortality_event]. Source-backed obituary comic. Full story + sources: https://www.finalnotes.page/comics/<slug>/`
- Tags: person name, "obituary comic", "biography", "memento mori", subject's field
- Pin a comment linking the source page.

Once the channel exists, add its URL to `SAME_AS_URLS` in `lib/site.js`.

---

## 5. Substack Notes, directories, and quotable assets

- **Substack Notes:** reshare each comic as a Note with the same hook + canonical link. Notes are indexed and drive discovery.
- **Directories / niche newsletters:** submit to comic/illustration roundups, "memento mori" and stoicism newsletters, and history-comic lists. Each is a real backlink + mention.
- **Quotable linkable asset:** the `obituary-vs-death-notice`, `obituary-vs-eulogy`, and `obituary-cost` pages are reference-grade. Pitch them to funeral-planning and grief-support sites as a free resource to link — these are the pages most likely to earn natural citations.
- **IndexNow** is already wired (`scripts/submit_indexnow.mjs`) — re-run it after publishing each new comic to ping Bing/Yandex instantly.

---

## Cadence (first 30 days)

| Week | Actions |
|------|---------|
| 1 | Create Wikidata item; add to `SAME_AS_URLS`. Fix GSC (Domain property + DNS TXT), submit sitemap, Request Indexing on homepage. Post Show HN. |
| 2 | 2–3 Reddit posts (different subs/subjects). Submit to 3 directories/newsletters. |
| 3 | Launch YouTube with 3 Shorts. 2 more Reddit posts. Substack Notes for each comic. |
| 4 | Pitch the comparison/cost pages to 5 grief/funeral resource sites. Re-run IndexNow. Review GSC coverage. |

After each new platform account goes live, add its URL to `SAME_AS_URLS` in
`lib/site.js` and redeploy so the site's structured data links every profile —
that `sameAs` web is exactly what AI engines use to resolve the brand entity.
