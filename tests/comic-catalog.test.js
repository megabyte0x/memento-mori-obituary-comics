import assert from "node:assert/strict";
import test from "node:test";

import {
  declaredComicAssetKeys,
  mergeComic,
  normalizeCatalog,
} from "../lib/comic-catalog.js";

function comic(overrides = {}) {
  return {
    slug: "comic",
    person: "Comic Person",
    title: "Comic Title",
    published_at: "2026-07-12",
    pages: ["pages/01.jpg"],
    ...overrides,
  };
}

test("normalizeCatalog rejects a comic without a slug or pages", () => {
  assert.throws(
    () => normalizeCatalog([{ slug: "", pages: [] }]),
    /missing slug|missing pages/i,
  );
});

test("mergeComic replaces a slug and orders newest first", () => {
  const catalog = mergeComic(
    [comic({ slug: "older", published_at: "2026-01-01" })],
    comic({ slug: "newer" }),
  );

  assert.deepEqual(catalog.map((comic) => comic.slug), ["newer", "older"]);
});

test("declaredComicAssetKeys includes pages, PDF, and contact sheet files", () => {
  assert.deepEqual(
    declaredComicAssetKeys({
      ...comic({ slug: "ada" }),
      pdf: "ada.pdf",
      contact_sheet: "contact.jpg",
    }),
    [
      "comics/ada/pages/01.jpg",
      "comics/ada/ada.pdf",
      "comics/ada/contact.jpg",
    ],
  );
});
