import assert from "node:assert/strict";
import test from "node:test";

import cloudflareLoader from "../image-loader.js";

test("Cloudflare loader transforms private media through the zone", () => {
  assert.equal(
    cloudflareLoader({
      src: "/media/comics/sample/pages/01.jpg",
      width: 640,
      quality: 75,
    }),
    "/cdn-cgi/image/width=640,quality=75/media/comics/sample/pages/01.jpg",
  );
});

test("Cloudflare loader omits quality when Next does not provide it", () => {
  assert.equal(
    cloudflareLoader({ src: "/media/comics/sample/pages/01.jpg", width: 384 }),
    "/cdn-cgi/image/width=384/media/comics/sample/pages/01.jpg",
  );
});
