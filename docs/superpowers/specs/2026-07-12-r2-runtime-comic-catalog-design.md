# R2 Runtime Comic Catalogue

## Decision

Make the private Cloudflare R2 bucket the production source of truth for comic metadata and media. A single signed publish operation will make a new or updated comic visible on the next request without rebuilding or redeploying the Worker.

The checked-in `comics.json` remains a development seed and editorial audit record. It no longer determines the production catalogue after the initial R2 manifest is seeded.

## Requirements

- Publishing a comic must update the homepage, reader, guide cards, sitemap, `llms.txt`, structured data, and latest-PDF selection without `pnpm deploy`.
- A comic becomes public only after all of its declared R2 media exists and its metadata passes existing editorial validation.
- A failed or partial upload must not add a broken comic to the public catalogue.
- Publishing an existing slug replaces its metadata and leaves the catalogue ordered newest first by `published_at`.
- The existing Ed25519 signing key remains the only authority for media and metadata publication.
- The production site must not silently fall back to stale bundled data when a required R2 manifest cannot be read.

## Storage Contract

The existing private `finalnotes-comics` bucket stores media at stable keys such as:

```text
comics/<slug>/pages/<page>.jpg
comics/<slug>/<slug>.pdf
```

It will also store one catalogue manifest:

```text
catalog/comics.json
```

The manifest is a JSON array using the current `comics.json` comic schema. It includes the full metadata needed by readers, SEO/GEO output, sitemap entries, and the paid-PDF endpoint. It is written only after the publisher verifies every declared page, PDF, contact sheet, and reel asset in R2.

## Runtime Read Path

`lib/comics` will separate pure presentation helpers from an asynchronous catalogue loader. In Cloudflare production, the loader reads `catalog/comics.json` from the bound R2 bucket once per request. In local development only, it can use the checked-in seed when no R2 binding is available.

Every route whose rendered output depends on the comic catalogue becomes runtime-rendered: the archive, comic readers and metadata, relevant guides, sitemap, `llms.txt`, layout-derived social metadata, and latest-PDF selection. The catalogue is intentionally not served from a stale HTML or data cache, so the request immediately after publication sees the new manifest.

The R2 read path is small and private. The site continues to serve media through `/media/comics/...`, preserving stable public URLs and cache headers.

## Publish Transaction

The local publisher performs these steps in order:

1. Build and validate the staged comic metadata using `scripts/add_comic.py`.
2. Upload only that comic's media through the existing signed upload route.
3. Verify the uploaded media through the public `/media` route.
4. Send the full comic metadata to a new signed publish route.
5. The Worker validates metadata, verifies every declared R2 object, merges the comic into `catalog/comics.json`, sorts the catalogue, and writes the manifest as the final operation.
6. The publisher verifies the reader URL, homepage presence, sitemap entry, and latest-PDF behaviour.

The new route uses the existing signing payload convention, extended with canonical JSON metadata and its SHA-256 digest. A retry is idempotent: it rewrites the same slug entry and produces the same ordered manifest.

Unreferenced media from a failed upload remains private and invisible. The manifest is the only public-release switch.

## Authoring and Repository Flow

The replacement for `scripts/deploy_latest.sh` is a publish command that does not call `pnpm deploy`. It may update local editorial files for review, but Git commit and push are separate from publication and are not required for a new comic to go live.

An initial one-time rollout seeds `catalog/comics.json` from the current checked-in archive, deploys the runtime catalogue reader and publish route, and verifies that production reads the seeded manifest. Future comic publication does not rebuild or redeploy the site.

## Failure Handling

- Invalid metadata returns a validation error and leaves the current manifest unchanged.
- A missing or wrong-size R2 asset returns a publish error and leaves the current manifest unchanged.
- Invalid or expired signatures return `401` or `400` and perform no write.
- R2 read failure in production returns an explicit server error; it does not silently expose a stale compile-time archive.
- A missing manifest is allowed only in local development before the initial seed. Production seeding is a release prerequisite.

## Verification

Automated tests will prove:

- manifest parsing, ordering, and required-field validation;
- runtime catalogue reads from a mocked R2 binding;
- publish rejects absent assets and invalid signatures without altering the manifest;
- publish exposes a valid new slug after the manifest write;
- homepage, reader metadata, sitemap, `llms.txt`, guide selection, and latest-PDF selection use runtime catalogue data;
- the publishing command has no Worker deployment step.

The rollout verification will seed the production manifest, publish a non-production fixture only in test infrastructure, and confirm that production content reads from R2 before the old static dependency is removed from active routes.

## Non-goals

- This does not create a public R2 bucket or expose direct R2 URLs.
- This does not add a database, admin UI, or background queue.
- This does not remove the checked-in editorial archive or change the existing comic metadata schema.
