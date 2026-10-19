# Publishing agent contract

The local agent researches a subject, writes the storyline, draws the comic, and
publishes it. This file lists what it must produce for each comic so the reader
page, theme pages, search results, and social posts work. The site renders
whatever the agent provides; `lib/comic-catalog.js` rejects comics published on or
after **2026-10-20** that are missing the required fields.

## Pipeline

```text
pick subject ─▶ research + storyline ─▶ draw pages ─▶ write comic.json
      │                                                    │
      │                     pnpm comic:enrich -- --metadata-file comic.json
      │                     (Wikidata ID + exact birth/death dates)
      ▼                                                    ▼
anniversary check                         pnpm comic:publish -- --slug <slug> --metadata-file comic.json
(/anniversaries.json)                     (validates, uploads, verifies, pings IndexNow)
                                                           │
                                          pnpm comic:social -- --metadata-file comic.json --out kit.json
                                          (post the carousel, pins, and short post)
```

## 1. Choosing subjects

Searches for a person spike around the anniversaries of their birth and death.
Prefer subjects whose birth or death anniversary falls **10–21 days after the
publication date**, so the page is indexed before the spike. Round anniversaries
(25th, 50th, 100th…) are worth the most.

Before choosing a new subject, fetch
`https://www.finalnotes.page/anniversaries.json?days=21` and re-share any
already-published comic listed there (see section 5) instead of competing with it.

## 2. Required `comic.json` fields

Existing fields (`slug`, `title`, `person`, `years`, `dek`, `mortality_event`,
`published_at`, `pages`, `page_dimensions`, `sources`, `sameAs`,
`citation_passage`, `page_summaries`, `pdf`) are unchanged. New fields:

| Field | Required | Content |
| --- | --- | --- |
| `page_transcripts` | yes | One string per page, same order as `pages`. Start with `Caption: <lettered text, verbatim>`, then a blank line, then one `Panel N: <what the panel shows>` line per panel, taken from the storyline. Plain language, no interpretation the art does not show. This is the text search engines and screen readers get instead of the image. |
| `faq` | yes | 3–8 `{ "question", "answer", "source_url" }` objects (`source_url` optional; shown as a "Source" link). Use questions people actually search: "How did X die?", "How old was X when they died?", "What did X do after <event>?", "Why is X important?". Answers are 1–3 sentences, factual, and supported by the listed `sources`. |
| `themes` | yes | 1–4 slugs from `lib/themes.js`, most important first (the first is the breadcrumb): `cancer`, `illness`, `blindness`, `disability`, `holocaust`, `prison`, `war`, `artists`, `writers`, `musicians`, `scientists`, `civil-rights`, `athletes-explorers`, `faith`, `women`. |
| `death_date` | yes | `YYYY-MM-DD`. Filled by `pnpm comic:enrich`. |
| `birth_date` | when known | `YYYY-MM-DD`. Filled by `pnpm comic:enrich`. |
| `seo_title` | optional | Up to 65 characters. Lead with the name and the searchable hook, e.g. `Terry Fox: How Cancer Shaped the Marathon of Hope`. Defaults to `<Person>: <Story> \| Biography Comic`. |
| `seo_description` | optional | 70–160 characters answering "who was X and what happened". Defaults to the first sentence of `citation_passage`. |
| `og_image` | optional | Asset path to a 1200×630 JPEG uploaded with the comic. Without it the site composes one from the cover at `/share-card/<slug>.jpg`. |

Example:

```json
{
  "page_transcripts": [
    "Caption: Terry Fox (1958–1981) lost a leg to cancer. Then he asked a country to run the rest of the way.\n\nPanel 1: A close portrait of Terry, young and curly-haired.\nPanel 2: Two doctors confer at the end of a hospital corridor."
  ],
  "faq": [
    { "question": "How did Terry Fox die?", "answer": "Terry Fox died of cancer on June 28, 1981, aged 22, after the bone cancer that had cost him a leg spread to his lungs." },
    { "question": "How far did Terry Fox run?", "answer": "He ran 5,373 kilometres in 143 days before stopping near Thunder Bay, Ontario, on September 1, 1980." },
    { "question": "What happened after Terry Fox stopped running?", "answer": "The annual Terry Fox Run continued his fundraising for cancer research after his death." }
  ],
  "themes": ["cancer", "athletes-explorers", "disability"]
}
```

## 3. Before publishing

```bash
pnpm comic:enrich -- --metadata-file /path/to/comic.json
pnpm comic:publish -- --slug <slug> --metadata-file /path/to/comic.json
```

`comic:enrich` resolves the subject through `sameAs`/Wikipedia to Wikidata, adds
the Wikidata URL to `sameAs`, and writes exact dates only when the death year
matches `years`. If it cannot resolve the person, add a Wikipedia or Wikidata URL
to `sameAs` and rerun; do not type dates by hand without a source.

`comic:publish` now also checks that the FAQ and transcripts appear on the live
page and pings IndexNow for the comic, homepage, and its theme pages.

## 4. Backfilling older comics

`pnpm comic:audit` lists every live comic still missing transcripts, an authored
FAQ, or page summaries. For each one, regenerate those fields from the stored
storyline and republish metadata only:

```bash
pnpm comic:publish -- --slug <slug> --metadata-file /path/to/comic.json --metadata-only
```

Themes and exact dates for the comics published before this contract live in
`data/comic-enrichment.json`, and their page transcripts and FAQs in
`data/comic-reader-text.json`. Values in the catalogue override both files, so
republishing a comic with its own fields replaces the backfill.

## 5. Social distribution

```bash
pnpm comic:social -- --metadata-file /path/to/comic.json --out kit.json
```

The kit contains an Instagram/Threads carousel (page image URLs, per-page alt
text, caption, UTM-tagged link), three Pinterest pins boarded by primary theme,
and a short post for X/Bluesky using the 1200×630 share card. Post it the day the
comic publishes, and again when `/anniversaries.json` lists the subject.
