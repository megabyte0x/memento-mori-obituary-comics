import assert from "node:assert/strict";
import test from "node:test";

import cloudflareLoader from "../image-loader.js";

test("Cloudflare loader transforms private media through the Worker Images binding", () => {
  assert.equal(
    cloudflareLoader({
      src: "/media/comics/sample/pages/01.jpg",
      width: 640,
      quality: 75,
    }),
    "/optimized-image/640/75/comics/sample/pages/01.jpg",
  );
});

test("Cloudflare loader uses the configured default quality when Next omits it", () => {
  assert.equal(
    cloudflareLoader({ src: "/media/comics/sample/pages/01.jpg", width: 384 }),
    "/optimized-image/384/75/comics/sample/pages/01.jpg",
  );
});
