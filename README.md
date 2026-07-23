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

Comic metadata lives in `comics.json`, with per-comic source metadata under `comics/<slug>/comic.json`. The checked-in archive is the local editorial record; production reads the signed `catalog/comics.json` manifest in the private `finalnotes-comics` R2 bucket. Rendered media remains behind `/media/comics/<slug>/...`; R2 is never public.

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

Publish a staged comic through the signed production route and private R2:

```bash
pnpm comic:publish -- --slug <slug>
```

The command validates metadata, uploads and verifies only that comic's media, signs the complete metadata with `~/.config/finalnotes/blob-upload-ed25519.pem`, and writes the R2 catalogue last. It then checks the reader, homepage, sitemap, and `llms.txt`. It does not rebuild or redeploy the Worker. The legacy `scripts/deploy_latest.sh /comics/<slug>/` command delegates to this publisher for compatibility.

The Worker verifies the shared signing authority against `FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY` and writes stable keys such as `comics/<slug>/pages/01-<slug>.jpg`. A failed or partial upload is invisible because the catalogue manifest is the final release switch.

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
```

For the one-time runtime-catalogue release, seed the existing editorial archive before deploying the Worker code that reads it:

```bash
pnpm comic:seed-catalog
pnpm deploy
```

After that release is live, use `pnpm comic:publish -- --slug <slug>` for future comics; do not run `pnpm deploy` for normal comic publication.

Create the R2 bucket once with `pnpm exec wrangler r2 bucket create finalnotes-comics`. Set `X402_PAY_TO`, `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, and `FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY` as Worker secrets. Public `NEXT_PUBLIC_*` values must be available during the Next build and in Cloudflare Workers Builds.

Keep the R2 bucket private; original image bytes are served by the application `/media` route. The fail-safe `pnpm deploy` command emits original R2 image URLs so production and `workers.dev` previews remain complete. Use `pnpm deploy:images` for production responsive delivery: the Worker `IMAGES` binding transforms streamed R2 objects into WebP through `/optimized-image/<width>/75/...`, while the route falls back to the original R2 bytes if transformation is unavailable.

After every optimized deployment, probe a generated URL for `Content-Type: image/webp`, `X-Finalnotes-Image-Transform: images-binding`, and immutable cache headers, then confirm homepage and reader HTML contain responsive `/optimized-image/...` candidates. If the binding path fails, deploy with the fail-safe `pnpm deploy` command while investigating.

For a source-reviewed metadata correction to a comic that already exists in R2, use a signed metadata-only publication. The API revalidates the full GEO contract and checks every declared asset before replacing the catalogue entry:

```bash
pnpm comic:publish -- --slug <slug> --metadata-file /absolute/path/to/comic.json --metadata-only
```

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
