# Cloudflare Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the complete Final Notes Next.js website from Vercel to Cloudflare Workers while preserving private comic media, signed uploads, x402-paid PDF delivery, analytics, canonical URLs, and production behavior.

**Architecture:** Deploy Next.js 16 to Cloudflare Workers through `@opennextjs/cloudflare`. Replace Vercel Blob with one private R2 bucket exposed only through the existing application routes, and replace Vercel Analytics/Speed Insights with Cloudflare Web Analytics while retaining Mixpanel. Keep the public URL contract unchanged so the final DNS cutover does not change reader or API URLs.

**Tech Stack:** Next.js 16, React 19, OpenNext Cloudflare adapter, Wrangler 4, Cloudflare Workers, R2, Cloudflare Images, x402/Hono, Node test runner, Python unittest.

## Global Constraints

- Preserve `https://www.finalnotes.page` as the canonical production origin.
- Preserve `GET` and `HEAD /media/comics/...`, `GET /api/latest-pdf`, and `POST /api/admin/blob-upload` behavior.
- Keep comic media private in R2; do not expose an R2 public development URL.
- Do not commit secrets, `.dev.vars`, build output, or account identifiers that are not safe deployment configuration.
- Leave the untracked `producthunt-media/` directory untouched.
- Use Cloudflare Workers through OpenNext, not Pages or a static-only export.

---

### Task 1: R2 media contract

**Files:**
- Modify: `tests/blob-media.endpoint.test.js`
- Modify: `tests/blob-media.helpers.test.js`
- Modify: `lib/blob-media.js`
- Modify: `app/media/[...path]/route.js`

**Interfaces:**
- Consumes: an R2-compatible bucket with `get(key, options)` and `head(key)` methods.
- Produces: `createApp({ bucket })`, `GET(request)`, and `HEAD(request)` returning the existing media response contract.

- [ ] **Step 1: Write the failing R2 endpoint tests**

Update endpoint fixtures to return R2 objects with `body`, `size`, `httpEtag`, and `httpMetadata.contentType`; assert that GET streams the object, HEAD has no body, and matching `If-None-Match` returns 304.

- [ ] **Step 2: Run the tests and verify the Vercel-shaped implementation fails**

Run: `node --test tests/blob-media.endpoint.test.js tests/blob-media.helpers.test.js`

Expected: FAIL because the implementation calls Vercel Blob and reads `result.stream`/`result.blob` instead of the R2 object contract.

- [ ] **Step 3: Implement the minimal R2-backed handler**

Use the injected bucket in `createApp`, map `R2ObjectBody.body` to the response body, and map `httpEtag`, `size`, and `httpMetadata.contentType` to existing headers. Resolve the production binding in the route with:

```js
const { env } = getCloudflareContext();
return createApp({ bucket: env.COMICS_BUCKET }).fetch(request);
```

- [ ] **Step 4: Run the focused tests**

Run: `node --test tests/blob-media.endpoint.test.js tests/blob-media.helpers.test.js`

Expected: PASS.

### Task 2: R2 paid PDF and signed upload

**Files:**
- Modify: `tests/latest-pdf.endpoint.test.js`
- Modify: `tests/blob-upload-auth.test.js`
- Modify: `lib/latest-pdf.js`
- Modify: `app/api/latest-pdf/route.js`
- Modify: `app/api/admin/blob-upload/route.js`

**Interfaces:**
- Consumes: the same `COMICS_BUCKET` binding and existing `X402_PAY_TO`/`FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY` values.
- Produces: payment challenge behavior, private PDF streaming after payment, and signed R2 writes with stable keys.

- [ ] **Step 1: Write failing R2 fixtures**

Change endpoint tests to inject `bucket.get()`/`bucket.put()` and assert `put(key, bytes, { httpMetadata })` rather than Vercel Blob options.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/latest-pdf.endpoint.test.js tests/blob-upload-auth.test.js`

Expected: FAIL because the routes still use `@vercel/blob`.

- [ ] **Step 3: Implement R2 access**

Pass the Cloudflare binding from each route to the existing testable handler. Read PDF bytes from `object.body`, use `object.size`, and write uploads with:

```js
await bucket.put(safeBlobPath, buffer, {
  httpMetadata: { contentType: expectedContentType, cacheControl: `public, max-age=${ONE_YEAR}, immutable` },
});
```

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/latest-pdf.endpoint.test.js tests/blob-upload-auth.test.js`

Expected: PASS.

### Task 3: OpenNext deployment configuration and Vercel removal

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `next.config.mjs`
- Create: `open-next.config.ts`
- Create: `wrangler.jsonc`
- Create: `public/_headers`
- Modify: `.gitignore`
- Modify: `.env.example`
- Modify: `app/layout.jsx`
- Delete: `vercel.json`
- Delete: `.vercelignore`

**Interfaces:**
- Consumes: OpenNext build output and `COMICS_BUCKET` R2 binding.
- Produces: `pnpm preview`, `pnpm deploy`, and `pnpm cf-typegen` commands plus a Worker deploy artifact.

- [ ] **Step 1: Add a failing migration guard test**

Create `tests/cloudflare-migration.test.js` asserting required scripts/configuration exist and production dependencies contain no `@vercel/*` packages.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/cloudflare-migration.test.js`

Expected: FAIL on missing OpenNext/Wrangler configuration and remaining Vercel packages.

- [ ] **Step 3: Add Cloudflare configuration**

Install latest compatible `@opennextjs/cloudflare` and Wrangler, configure `.open-next/worker.js`, `.open-next/assets`, `nodejs_compat`, `COMICS_BUCKET`, Cloudflare Images, observability, and `finalnotes.page`/`www.finalnotes.page` routes. Remove the build-time Vercel Blob backfill and Vercel telemetry components.

- [ ] **Step 4: Verify GREEN and generate binding types**

Run: `node --test tests/cloudflare-migration.test.js && pnpm cf-typegen`

Expected: PASS and `cloudflare-env.d.ts` generated.

### Task 4: Documentation and full local verification

**Files:**
- Modify: `README.md`
- Modify: `.github/workflows/README.md`

**Interfaces:**
- Consumes: the Cloudflare scripts, R2 binding, and environment contract from Tasks 1-3.
- Produces: exact setup, upload, preview, deploy, and custom-domain instructions.

- [ ] **Step 1: Replace Vercel operational instructions**

Document `wrangler login`, R2 bucket creation, build-time public variables, Worker secrets, media migration, preview, deploy, and DNS verification without embedding credentials.

- [ ] **Step 2: Run the full test and build suite**

Run: `pnpm test && pnpm build && pnpm exec opennextjs-cloudflare build && pnpm exec wrangler deploy --dry-run`

Expected: all tests pass; Next and OpenNext builds finish; Wrangler validates the Worker bundle.

### Task 5: Cloudflare resource creation, data migration, deployment, and cutover

**Files:**
- No source files unless runtime verification exposes a defect, in which case add a failing regression test before changing production code.

**Interfaces:**
- Consumes: authenticated Wrangler session, current Vercel-served private media, Cloudflare R2/Workers/DNS access.
- Produces: populated private R2 bucket, deployed Worker, custom domains, and verified production behavior.

- [ ] **Step 1: Verify account state and create the bucket**

Run: `pnpm exec wrangler whoami` and `pnpm exec wrangler r2 bucket create finalnotes-comics`.

- [ ] **Step 2: Migrate every comic image and PDF**

Derive stable `comics/<slug>/...` keys from `comics.json`, fetch each current `/media/<key>` response from `www.finalnotes.page`, upload it with `wrangler r2 object put`, and verify source count, destination count, byte length, and representative checksums.

- [ ] **Step 3: Configure secrets and deploy**

Set `X402_PAY_TO` and the optional upload public key as Worker secrets without printing them, then run `pnpm deploy`.

- [ ] **Step 4: Verify the workers.dev release**

Check homepage, archive, a comic reader, image GET/HEAD, sitemap, robots, `llms.txt`, the x402 challenge, and signed-upload rejection behavior.

- [ ] **Step 5: Cut over and verify the canonical domain**

Attach both custom domains, confirm Cloudflare DNS/routing, and repeat the release checks on `https://www.finalnotes.page`. Confirm Vercel is no longer serving the canonical domain before declaring the migration complete.
