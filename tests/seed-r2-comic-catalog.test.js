import assert from "node:assert/strict";
import test from "node:test";

import {
  catalogJsonForSeed,
  wranglerSeedArgs,
} from "../scripts/seed_r2_comic_catalog.js";

test("catalogJsonForSeed validates and normalizes the local editorial archive", () => {
  const json = catalogJsonForSeed([
    {
      slug: "older",
      person: "Older Person",
      title: "Older Comic",
      published_at: "2026-01-01",
      pages: ["pages/01.jpg"],
    },
    {
      slug: "newer",
      person: "Newer Person",
      title: "Newer Comic",
      published_at: "2026-07-12",
      pages: ["pages/01.jpg"],
    },
  ]);

  assert.deepEqual(JSON.parse(json).map((comic) => comic.slug), ["newer", "older"]);
});

test("wranglerSeedArgs writes the private R2 catalogue object remotely", () => {
  assert.deepEqual(wranglerSeedArgs("/tmp/catalog.json"), [
    "exec",
    "wrangler",
    "r2",
    "object",
    "put",
    "finalnotes-comics/catalog/comics.json",
    "--file",
    "/tmp/catalog.json",
    "--remote",
    "--content-type",
    "application/json",
  ]);
});
