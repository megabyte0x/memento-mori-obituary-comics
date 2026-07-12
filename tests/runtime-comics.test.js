import assert from "node:assert/strict";
import test from "node:test";

import { loadRuntimeComics } from "../lib/runtime-comics.js";

test("loadRuntimeComics reads and normalizes catalog/comics.json from R2", async () => {
  const bucket = {
    get: async () => ({
      body: new Blob(["[]"]).stream(),
      json: async () => [{
        slug: "r2",
        person: "R2 Person",
        title: "R2 Comic",
        published_at: "2026-07-12",
        pages: ["pages/01.jpg"],
      }],
    }),
  };

  const comics = await loadRuntimeComics({ bucket, environment: "production" });
  assert.equal(comics[0].slug, "r2");
});

test("loadRuntimeComics rejects a missing production manifest", async () => {
  await assert.rejects(
    loadRuntimeComics({ bucket: { get: async () => null }, environment: "production" }),
    /catalogue manifest is unavailable/i,
  );
});

test("loadRuntimeComics uses the seed only in local development", async () => {
  const comics = await loadRuntimeComics({
    bucket: null,
    environment: "development",
    seed: [{
      slug: "seed",
      person: "Seed Person",
      title: "Seed Comic",
      published_at: "2026-07-12",
      pages: ["pages/01.jpg"],
    }],
  });

  assert.equal(comics[0].slug, "seed");
});
