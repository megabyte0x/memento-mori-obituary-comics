# Latest Comics SEO and GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the newest three comics source-grounded, passage-level SEO/GEO content and enforce the same quality for future uploads.

**Architecture:** Enriched comic metadata remains the single source of truth in `comics.json` and each `comics/<slug>/comic.json`. The publishing script ingests and validates a JSON enrichment object before writing; the server-rendered reader, JSON-LD, and `llms.txt` consume the validated fields without inventing missing copy.

**Tech Stack:** Python 3 standard library, Node.js test runner, Next.js 16 App Router, React 19, Schema.org JSON-LD.

## Global Constraints

- `citation_passage` must contain 134–167 words inclusive.
- `page_summaries` must contain exactly one factual caption per page image.
- `sameAs` and structured source URLs must be absolute HTTPS URLs.
- Reader answer blocks must be visible and present in initial server-rendered HTML.
- Keep legacy comics working when `citation_passage` is absent.
- Do not modify Blob media or paid PDF delivery.
- Preserve the unrelated untracked `producthunt-media/` directory.

---

### Task 1: Enforce the publishing enrichment contract

**Files:**
- Modify: `scripts/add_comic.py`
- Create: `tests/test_add_comic.py`
- Modify: `package.json`

**Interfaces:**
- Consumes: UTF-8 JSON passed through `--metadata-json PATH`.
- Produces: `load_enrichment(path) -> dict`, `validate_enrichment(comic) -> None`, and a merged comic record containing `citation_passage`, `page_summaries`, and `sameAs`.

- [ ] **Step 1: Write failing Python unit tests**

Test a 134-word passage and a 167-word passage as valid, 133/168 words as invalid, mismatched captions as invalid, non-HTTPS entity/source URLs as invalid, JSON parsing, metadata merge, and validation before filesystem writes. Use `unittest.mock.patch.object(add_comic, "ROOT", temp_root)` to isolate writes.

```python
class EnrichmentValidationTests(unittest.TestCase):
    def valid_comic(self, words=134):
        return {
            "slug": "sample",
            "person": "Sample Person",
            "title": "Sample",
            "published_at": "2026-07-07",
            "pages": ["pages/01.jpg"],
            "sources": [{"name": "Primary", "url": "https://example.com/source"}],
            "citation_passage": " ".join(["word"] * words),
            "page_summaries": ["A factual page summary."],
            "sameAs": ["https://www.wikidata.org/wiki/Q1"],
        }

    def test_rejects_short_citation_passage(self):
        with self.assertRaisesRegex(SystemExit, "134 to 167 words"):
            add_comic.validate_enrichment(self.valid_comic(133))
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `python3 -m unittest tests.test_add_comic -v`

Expected: import or attribute failures because enrichment functions do not exist.

- [ ] **Step 3: Implement parsing, merging, and validation**

Add an allowlist and strict helpers:

```python
ENRICHMENT_FIELDS = {"citation_passage", "page_summaries", "sameAs"}

def load_enrichment(path_value: str | None) -> dict[str, Any]:
    if not path_value:
        return {}
    path = Path(path_value).expanduser().resolve()
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SystemExit(f"invalid enrichment metadata {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise SystemExit(f"invalid enrichment metadata {path}: expected a JSON object")
    return {key: value[key] for key in ENRICHMENT_FIELDS if key in value}

def is_https_url(value: Any) -> bool:
    parsed = urllib.parse.urlparse(str(value or ""))
    return parsed.scheme == "https" and bool(parsed.netloc)
```

`validate_enrichment` must accumulate field-specific errors and raise one `SystemExit`. Merge enrichment into the in-memory record only after media discovery, validate the complete record before removing/replacing the target directory, then copy media and write both metadata locations. Add `--metadata-json` to argparse.

- [ ] **Step 4: Include Python tests in the standard test gate**

Set:

```json
"test": "python3 -m unittest discover -s tests -p 'test_*.py' && node --test tests/*.test.js"
```

- [ ] **Step 5: Run focused and standard tests**

Run: `python3 -m unittest tests.test_add_comic -v && pnpm test`

Expected: all enrichment tests and the existing Node suite pass.

- [ ] **Step 6: Commit Task 1**

```bash
git add scripts/add_comic.py tests/test_add_comic.py package.json
git commit -m "feat(publishing): enforce comic GEO metadata"
```

### Task 2: Inspect and enrich the latest three comics

**Files:**
- Modify: `comics.json`
- Modify: `comics/audre-lorde-cancer-journals/comic.json`
- Modify: `comics/oliver-sacks-gratitude-near-the-end/comic.json`
- Modify: `comics/django-reinhardt-two-finger-fire/comic.json`
- Modify: `tests/comics-data.test.js`

**Interfaces:**
- Consumes: production panel images and the linked source pages already present in each record.
- Produces: synchronized `citation_passage`, seven `page_summaries`, and verified `sameAs` arrays for each comic.

- [ ] **Step 1: Add a failing latest-three contract test**

```js
test("latest three comics satisfy the GEO publishing contract in both metadata stores", () => {
  for (const comic of comics.slice(0, 3)) {
    const words = comic.citation_passage.trim().split(/\s+/);
    assert.ok(words.length >= 134 && words.length <= 167, `${comic.slug} passage length`);
    assert.equal(comic.page_summaries.length, comic.pages.length, `${comic.slug} captions`);
    assert.ok(comic.sameAs.length > 0 && comic.sameAs.every((url) => url.startsWith("https://")));
    const perComic = JSON.parse(readFileSync(path.join(ROOT, "comics", comic.slug, "comic.json"), "utf8"));
    assert.deepEqual(perComic, comic);
  }
});
```

- [ ] **Step 2: Run the focused Node test and verify RED**

Run: `node --test --test-name-pattern="latest three comics" tests/comics-data.test.js`

Expected: fail because `citation_passage`, `page_summaries`, and `sameAs` are absent.

- [ ] **Step 3: Inspect all 21 panel images**

Download the canonical `/media/comics/<slug>/<page>` images to `/tmp/finalnotes-latest-panels/<slug>/`, inspect contact sheets and individual pages, and record only visible events or wording. Do not infer panel content from filenames.

- [ ] **Step 4: Verify source claims and entity URLs**

Open each existing source URL and the chosen Wikidata/authoritative entity URLs. Use source-supported language only. Reject dead, redirected-to-unrelated, or ambiguous entity pages.

- [ ] **Step 5: Write and synchronize enrichment**

For each comic, write one 134–167-word self-contained passage, seven concise page summaries, and verified entity URLs. Apply byte-equivalent JSON objects to both metadata locations.

- [ ] **Step 6: Run data tests and verify GREEN**

Run: `node --test tests/comics-data.test.js`

Expected: all data tests pass and the latest-three synchronization assertion is green.

- [ ] **Step 7: Commit Task 2**

```bash
git add comics.json comics/audre-lorde-cancer-journals/comic.json comics/oliver-sacks-gratitude-near-the-end/comic.json comics/django-reinhardt-two-finger-fire/comic.json tests/comics-data.test.js
git commit -m "content(seo): enrich latest comics for AI citation"
```

### Task 3: Render the answer block and expose it to structured consumers

**Files:**
- Modify: `lib/comics.js`
- Modify: `lib/comic-presenters.js`
- Modify: `components/reader-shell.jsx`
- Modify: `app/globals.css`
- Modify: `app/llms.txt/route.js`
- Modify: `tests/seo-output.test.js`

**Interfaces:**
- Consumes: optional `comic.citation_passage: string`.
- Produces: `citationPassage(comic) -> string`, visible `.reader-introduction`, `WebPage.abstract`, `ComicStory.abstract`, and an `## Latest issues` section containing up to three enriched records.

- [ ] **Step 1: Write failing structured-output tests**

Assert that `citationPassage` returns authored text and `""` for legacy records; the latest comic schema uses the passage as both WebPage and ComicStory `abstract`; `llms.txt` contains `## Latest issues`, the latest three canonical URLs in order, and their exact passages.

```js
assert.equal(webpage.abstract, comic.citation_passage);
assert.equal(creativeWork.abstract, comic.citation_passage);
for (const latestComic of getComics().slice(0, 3)) {
  assert.ok(body.includes(absoluteUrl(`/comics/${latestComic.slug}/`)));
  assert.ok(body.includes(latestComic.citation_passage));
}
```

- [ ] **Step 2: Run SEO tests and verify RED**

Run: `node --test tests/seo-output.test.js`

Expected: fail because schema abstracts and latest-issues passages are absent.

- [ ] **Step 3: Implement the presenter and schema mapping**

In both server and client presenter modules:

```js
export function citationPassage(comic) {
  return String(comic?.citation_passage || "").replace(/\s+/g, " ").trim();
}
```

In `comicSchema`, conditionally spread `{ abstract: citationPassage(comic) }` into both WebPage and ComicStory nodes when non-empty.

- [ ] **Step 4: Render a visible answer block**

Before `<main id="read">`, render only when the passage exists:

```jsx
<section className="reader-introduction" aria-labelledby="reader-introduction-title">
  <p className="reader-introduction-kicker">Published {comic.published_at}</p>
  <h1 id="reader-introduction-title">Who was {comic.person}, and what is this comic about?</h1>
  <p>{passage}</p>
  <div className="reader-introduction-sources">
    <span>Sources</span>
    <ul>
      {sources.map((source) => (
        <li key={source.name}>
          {source.url ? <a href={source.url} rel="noopener noreferrer" target="_blank">{source.name}</a> : source.name}
        </li>
      ))}
    </ul>
  </div>
</section>
```

Use real anchors for URL-bearing sources and plain spans otherwise. Remove the duplicate screen-reader-only H1 so the visible question heading is the page H1. Add restrained responsive CSS that matches the dark reader surface and keeps the comic pages visually dominant.

- [ ] **Step 5: Add latest enriched passages to `llms.txt`**

Build:

```js
const latestIssueLinks = comics.slice(0, 3)
  .filter((comic) => citationPassage(comic))
  .map((comic) => `- [${comic.person} - ${comic.title}](${absoluteUrl(`/comics/${comic.slug}/`)}): ${citationPassage(comic)}`)
  .join("\n");
```

Emit it under `## Latest issues` before `## Comics`.

- [ ] **Step 6: Run SEO and full tests**

Run: `node --test tests/seo-output.test.js && pnpm test`

Expected: all tests pass.

- [ ] **Step 7: Commit Task 3**

```bash
git add lib/comics.js lib/comic-presenters.js components/reader-shell.jsx app/globals.css app/llms.txt/route.js tests/seo-output.test.js
git commit -m "feat(seo): surface citable comic introductions"
```

### Task 4: Verify the complete SEO/GEO story

**Files:**
- Modify only if verification exposes a defect in the files already listed.

**Interfaces:**
- Consumes: completed Tasks 1–3.
- Produces: test, build, initial-HTML, crawler-output, and clean-worktree evidence.

- [ ] **Step 1: Run static checks and the full test suite**

Run: `git diff --check && pnpm test`

Expected: no whitespace errors and all Python/Node tests pass.

- [ ] **Step 2: Build the production app**

Run: `pnpm build`

Expected: Next.js production build succeeds and all three comic routes are generated.

- [ ] **Step 3: Verify initial HTML**

Start `pnpm start`, request each latest comic route, and assert the response contains its question heading, exact citation passage, page-summary captions, canonical URL, and JSON-LD abstracts without executing JavaScript.

- [ ] **Step 4: Verify crawler surfaces**

Request `/robots.txt`, `/sitemap.xml`, and `/llms.txt`. Confirm allowed answer crawlers remain present, latest comic URLs appear in the sitemap, and the three authored passages appear in `llms.txt` in publication order.

- [ ] **Step 5: Audit scope and repository state**

Run: `git status --short && git log -4 --oneline`

Expected: only `producthunt-media/` remains untracked; implementation and design commits are present; no unrelated files are staged or modified.

- [ ] **Step 6: Commit any verification-only correction**

Only if Step 1–5 exposed a defect, stage the exact correction and commit with `fix(seo): correct latest comic GEO verification`.
