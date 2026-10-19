import assert from "node:assert/strict";
import test from "node:test";

import {
  declaredComicAssetKeys,
  mergeComic,
  normalizeCatalog,
  validatePublishableComic,
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

function publishableComic(overrides = {}) {
  const value = comic(overrides);
  return {
    ...value,
    sources: overrides.sources ?? [{ name: "Primary source", url: "https://example.com/source" }],
    citation_passage: overrides.citation_passage ?? Array.from({ length: 134 }, (_, index) => `word${index}`).join(" "),
    page_summaries: overrides.page_summaries ?? value.pages.map((_, index) => `Factual summary for page ${index + 1}.`),
    sameAs: overrides.sameAs ?? ["https://www.wikidata.org/wiki/Q7259"],
  };
}

test("normalizeCatalog rejects a comic without a slug or pages", () => {
  assert.throws(
    () => normalizeCatalog([{ slug: "", pages: [] }]),
    /missing slug|missing pages/i,
  );
});

test("normalizeCatalog rejects dates and asset paths that would corrupt discovery XML", () => {
  assert.throws(
    () => normalizeCatalog([comic({ published_at: "2026-02-30" })]),
    /invalid published_at/i,
  );
  assert.throws(
    () => normalizeCatalog([comic({ pages: ["pages/01&02.jpg"] })]),
    /unsafe page/i,
  );
});

test("mergeComic replaces a slug and orders newest first", () => {
  const catalog = mergeComic(
    [comic({ slug: "older", published_at: "2026-01-01" })],
    publishableComic({ slug: "newer" }),
  );

  assert.deepEqual(catalog.map((comic) => comic.slug), ["newer", "older"]);
});

test("validatePublishableComic enforces the SEO and GEO publishing contract", () => {
  assert.equal(validatePublishableComic(publishableComic()).slug, "comic");
  assert.throws(
    () => validatePublishableComic(publishableComic({ citation_passage: "too short" })),
    /134 to 167 words/i,
  );
  assert.throws(
    () => validatePublishableComic({ ...publishableComic(), page_summaries: [] }),
    /one page summary per page/i,
  );
  assert.throws(
    () => validatePublishableComic({ ...publishableComic(), sameAs: ["http://example.com/entity"] }),
    /sameAs.*HTTPS/i,
  );
  assert.throws(
    () => validatePublishableComic({ ...publishableComic(), sources: ["Source name only"] }),
    /sources.*HTTPS/i,
  );
});

test("comics published from the SEO cutoff must ship transcripts, FAQ, themes, and a death date", () => {
  const legacy = publishableComic({ published_at: "2026-10-19" });
  assert.equal(validatePublishableComic(legacy).slug, "comic");

  const current = publishableComic({ published_at: "2026-10-20" });
  assert.throws(() => validatePublishableComic(current), /page_transcripts.*faq.*themes.*death_date/s);

  const complete = {
    ...current,
    page_transcripts: ["Caption: A line.\n\nPanel 1: A scene."],
    faq: [1, 2, 3].map((n) => ({ question: `Question ${n}?`, answer: `Answer ${n}.` })),
    themes: ["cancer"],
    birth_date: "1958-07-28",
    death_date: "1981-06-28",
  };
  assert.equal(validatePublishableComic(complete).slug, "comic");
  assert.throws(() => validatePublishableComic({ ...complete, themes: ["not-a-theme"] }), /known theme slugs/);
  assert.throws(() => validatePublishableComic({ ...complete, death_date: "1981-02-30" }), /death_date must be an ISO/);
  assert.throws(() => validatePublishableComic({ ...complete, page_transcripts: ["a", "b"] }), /one entry per page/);
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
