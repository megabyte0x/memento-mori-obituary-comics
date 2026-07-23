import assert from "node:assert/strict";
import test from "node:test";

import { serveOptimizedImage } from "../lib/optimized-image.js";

function r2Image(body = "original-image") {
  return {
    body: new Blob([body]).stream(),
    httpEtag: '"source-etag"',
    httpMetadata: { contentType: "image/jpeg" },
    size: body.length,
  };
}

test("optimized image route transforms private R2 bytes through the Images binding", async () => {
  const calls = [];
  const pipeline = {
    transform(options) {
      calls.push(["transform", options]);
      return this;
    },
    async output(options) {
      calls.push(["output", options]);
      return {
        response() {
          return new Response("optimized-webp", {
            headers: { "content-type": "image/webp" },
          });
        },
      };
    },
  };
  const response = await serveOptimizedImage(
    new Request("https://example.com/optimized-image/640/75/comics/sample/pages/01.jpg"),
    {
      bucket: {
        async get(key) {
          calls.push(["get", key]);
          return r2Image();
        },
      },
      images: {
        input(stream) {
          calls.push(["input", stream instanceof ReadableStream]);
          return pipeline;
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
  assert.equal(response.headers.get("x-finalnotes-image-transform"), "images-binding");
  assert.match(response.headers.get("cache-control"), /max-age=31536000/);
  assert.match(response.headers.get("cdn-cache-control"), /s-maxage=31536000/);
  assert.equal(await response.text(), "optimized-webp");
  assert.deepEqual(calls, [
    ["get", "comics/sample/pages/01.jpg"],
    ["input", true],
    ["transform", { fit: "scale-down", width: 640 }],
    ["output", { format: "image/webp", quality: 75 }],
  ]);
});

test("optimized image route falls back to the original R2 image when the binding is unavailable", async () => {
  const response = await serveOptimizedImage(
    new Request("https://example.com/optimized-image/384/75/comics/sample/pages/01.jpg"),
    {
      bucket: { get: async () => r2Image() },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  assert.equal(response.headers.get("x-finalnotes-image-transform"), "original-fallback");
  assert.equal(await response.text(), "original-image");
});

test("optimized image route rejects unsupported widths before reading R2", async () => {
  let bucketRead = false;
  const response = await serveOptimizedImage(
    new Request("https://example.com/optimized-image/999/75/comics/sample/pages/01.jpg"),
    {
      bucket: {
        async get() {
          bucketRead = true;
          return r2Image();
        },
      },
    },
  );

  assert.equal(response.status, 400);
  assert.equal(bucketRead, false);
});
