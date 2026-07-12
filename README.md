# Memento Mori Obituary Comics

A Next.js archive for daily obituary comics about deceased people who faced death and made significant work afterward.

Production site: https://www.finalnotes.page/

Cloudflare Worker: https://finalnotes.yashygkf.workers.dev/

Repository: https://github.com/megabyte0x/memento-mori-obituary-comics

## Public resource links

These are the main public citation targets for readers, librarians, journalists, and teachers:

- [Obituary stories and articles](https://www.finalnotes.page/obituary-stories/)
- [Obituary articles as reported life stories](https://www.finalnotes.page/obituary-articles/)
- [How to write an obituary story](https://www.finalnotes.page/how-to-write-an-obituary-story/)
- [Obituary research guide](https://www.finalnotes.page/obituary-research-guide/)
- [Press and source-request resources](https://www.finalnotes.page/press/)

Repository citation map: [public obituary citation resources](docs/public-obituary-citation-resources.md).

## Maintainer surface

This project is maintained as a small open-source publishing system. The repo includes:

- a Next.js App Router archive and comic reader
- private Cloudflare R2 media storage with stable public `/media/...` URLs
- Cloudflare Image Transformations for R2-backed comic JPG/PNG covers and pages
- an x402-paid `GET /api/latest-pdf` endpoint for agent-accessible PDF delivery
- regression tests for R2 delivery, x402/latest-PDF behavior, upload tooling, and comic data

Each comic gets a durable permalink:

```text
/comics/<slug>/
```

## Development

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm test
pnpm build
pnpm preview
```

The app uses the Next.js App Router. Route and UI ownership is:

- `app/page.jsx` for the archive homepage.
- `app/comics/[slug]/page.jsx` and `components/reader-shell.jsx` for the reader.
- `app/media/[...path]/route.js` for private R2 media delivery through stable `/media/comics/...` URLs.
- `app/about/page.jsx` for editorial method.
- `app/press/page.jsx` for editors, reviewers, backlink outreach, and citation resources.
- `app/api/latest-pdf/route.js` for the paid agent PDF endpoint.
- `app/robots.js`, `app/sitemap.js`, and `app/llms.txt/route.js` for discovery files.
- `app/globals.css` for design tokens and component styling.

## Add a generated comic

Comic metadata lives in `comics.json`, with per-comic source metadata under `comics/<slug>/comic.json`. New generated images and PDFs are staged under `comics/<slug>/`, ignored by git, then uploaded to the private `finalnotes-comics` R2 bucket. The rendered site serves media from `/media/comics/<slug>/...`; it does not expose an R2 public URL.

```bash
python scripts/add_comic.py /path/to/generated-output \
  --slug new-comic-slug \
  --person "Name" \
  --title "Title" \
  --years "1900-2000" \
  --dek "Short description" \
  --event "Mortality event" \
  --sources "Source A; Source B"
```

Validate metadata without generating static HTML:

```bash
python scripts/add_comic.py --render-only
```

Upload staged media through the signed production route into private R2:

```bash
pnpm run r2:upload-live:dry-run -- --slug <slug> --require-assets
pnpm run r2:upload-live -- --slug <slug> --require-assets
pnpm run r2:verify-live -- --slug <slug>
```

The upload command signs each object with `~/.config/finalnotes/blob-upload-ed25519.pem`. The Worker verifies it against `FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY` and writes a stable R2 key such as `comics/<slug>/pages/01-<slug>.jpg`.

On this machine, older ignored binaries may still exist locally. Always pass `--slug` for a new release so only that comic is uploaded.

## Substack newsletter

The public newsletter surface is `Borrowed Time Dispatch` at:

```text
/newsletter/
```

The connected Substack publication is:

```text
https://finalnotes.substack.com
```

Launch copy and first-issue materials live in:

```text
docs/newsletter/substack-publication-profile.md
docs/newsletter/substack-launch-checklist.md
docs/newsletter/issue-001-borrowed-time-dispatch.md
```

## Cloudflare deployment

The app runs on Cloudflare Workers through the OpenNext adapter. `wrangler.jsonc` binds the private `finalnotes-comics` R2 bucket, and `open-next.config.ts` packages prerendered routes into Workers Static Assets.

```bash
pnpm cf-typegen
pnpm test
pnpm build
pnpm preview
pnpm deploy
```

Create the R2 bucket once with `pnpm exec wrangler r2 bucket create finalnotes-comics`. Set `X402_PAY_TO`, `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, and `FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY` as Worker secrets. Public `NEXT_PUBLIC_*` values must be available during the Next build and in Cloudflare Workers Builds.

Keep the R2 bucket private; image origins are served by the application `/media` route. Builds serve original R2 images by default so `workers.dev` previews remain complete. After the `finalnotes.page` zone is active and Cloudflare Image Transformations is enabled, build with `CLOUDFLARE_IMAGE_TRANSFORMATIONS=1` to emit optimized `/cdn-cgi/image/...` URLs.

## Paid agent PDF endpoint

Agents can request the latest comic PDF at:

```text
GET /api/latest-pdf
```

The endpoint uses x402 and requires an exact 0.1 USDC payment on Base mainnet (`eip155:8453`) before returning the PDF bytes.

Production deployments must set:

```text
X402_PAY_TO=0xYourReceivingWallet
CDP_API_KEY_ID=your-cdp-key-id
CDP_API_KEY_SECRET=your-cdp-key-secret
FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY=your-ed25519-public-key-pem
```
