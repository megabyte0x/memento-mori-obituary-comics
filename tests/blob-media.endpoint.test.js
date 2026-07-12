import assert from "node:assert/strict";
import test from "node:test";

import { createApp, HEAD } from "../lib/blob-media.js";

test("GET /media/comics/:path serves private R2 content through cacheable site URLs", async () => {
  const calls = [];
  const app = createApp({
    bucket: {
      async get(key) {
        calls.push(key);
        return {
          body: new Blob(["image-bytes"]).stream(),
          httpEtag: '"r2-etag"',
          httpMetadata: { contentType: "image/jpeg" },
          size: 11,
        };
      },
    },
  });

  const response = await app.fetch(
    new Request("https://example.com/media/comics/sample/pages/01.jpg", {
      headers: { "if-none-match": "old-etag" },
    }),
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  assert.equal(response.headers.get("content-length"), "11");
  assert.equal(response.headers.get("etag"), '"r2-etag"');
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
  assert.equal(response.headers.get("cdn-cache-control"), "public, max-age=31536000, s-maxage=31536000, immutable");
  assert.equal(response.headers.get("cloudflare-cdn-cache-control"), "public, max-age=31536000, s-maxage=31536000, immutable");
  assert.deepEqual(calls, ["comics/sample/pages/01.jpg"]);
});

test("HEAD /media/comics/:path returns cacheable metadata without a body", async () => {
  const app = createApp({
    bucket: {
      async head() {
        return {
          httpEtag: '"r2-etag"',
          httpMetadata: { contentType: "image/jpeg" },
          size: 11,
        };
      },
    },
  });

  const response = await app.fetch(new Request("https://example.com/media/comics/sample/pages/01.jpg", { method: "HEAD" }));

  assert.equal(response.status, 200);
  assert.equal(response.body, null);
  assert.equal(response.headers.get("content-length"), "11");
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
});

test("GET /media/comics/:path returns 304 when the R2 ETag matches", async () => {
  const app = createApp({
    bucket: {
      async get() {
        return {
          body: new Blob(["image-bytes"]).stream(),
          httpEtag: '"same-etag"',
          httpMetadata: { contentType: "image/jpeg" },
          size: 11,
        };
      },
    },
  });

  const response = await app.fetch(new Request("https://example.com/media/comics/sample/pages/01.jpg", {
    headers: { "if-none-match": '"same-etag"' },
  }));

  assert.equal(response.status, 304);
  assert.equal(response.headers.get("etag"), '"same-etag"');
});

test("GET /media/comics/:path rejects unsafe paths before R2 access", async () => {
  let called = false;
  const app = createApp({
    bucket: {
      async get() {
        called = true;
        throw new Error("should not read R2");
      },
    },
  });

  const response = await app.fetch(new Request("https://example.com/media/comics/sample/%2e%2e/secret.jpg"));

  assert.equal(response.status, 400);
  assert.equal(called, false);
});

test("HEAD export is available for media probes", () => {
  assert.equal(typeof HEAD, "function");
});
