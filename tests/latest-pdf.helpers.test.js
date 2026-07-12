import assert from "node:assert/strict";
import test from "node:test";

import {
  findLatestComicWithPdf,
  readLatestRuntimePdfFromBucket,
  readLatestPdfFromBucket,
  resolveComicPdfBlobPath,
} from "../lib/latest-pdf.js";

test("findLatestComicWithPdf returns the newest comic with a PDF", () => {
  const comics = [
    { slug: "older", published_at: "2026-05-29", pdf: "older.pdf" },
    { slug: "newer", published_at: "2026-05-31", pdf: "newer.pdf" },
  ];

  assert.equal(findLatestComicWithPdf(comics).slug, "newer");
});

test("readLatestRuntimePdfFromBucket selects the latest PDF from an injected runtime catalogue", async () => {
  const newerComic = { slug: "newer", published_at: "2026-05-31", pdf: "newer.pdf" };
  const calls = [];
  const result = await readLatestRuntimePdfFromBucket({
    loadComics: async () => [newerComic],
    bucket: {
      async get(key) {
        calls.push(key);
        return { body: new Blob(["pdf-bytes"]).stream(), size: 9 };
      },
    },
  });

  assert.equal(result.comic.slug, newerComic.slug);
  assert.deepEqual(calls, ["comics/newer/newer.pdf"]);
});

test("findLatestComicWithPdf keeps archive order when dates tie", () => {
  const comics = [
    { slug: "first", published_at: "2026-05-30", pdf: "first.pdf" },
    { slug: "second", published_at: "2026-05-30", pdf: "second.pdf" },
  ];

  assert.equal(findLatestComicWithPdf(comics).slug, "first");
});

test("findLatestComicWithPdf skips comics without PDF metadata", () => {
  const comics = [
    { slug: "newest-no-pdf", published_at: "2026-06-01" },
    { slug: "older-with-pdf", published_at: "2026-05-31", pdf: "older.pdf" },
  ];

  assert.equal(findLatestComicWithPdf(comics).slug, "older-with-pdf");
});

test("resolveComicPdfBlobPath rejects traversal PDF names", () => {
  assert.throws(
    () => resolveComicPdfBlobPath({ slug: "safe", pdf: "../secret.pdf" }),
    /Unsafe PDF filename/,
  );
});

test("resolveComicPdfBlobPath returns the expected private R2 key", () => {
  const resolved = resolveComicPdfBlobPath({ slug: "safe", pdf: "comic.pdf" });

  assert.equal(resolved, "comics/safe/comic.pdf");
});

test("readLatestPdfFromBucket reads the latest PDF from private R2", async () => {
  const calls = [];
  const comics = [
    { slug: "older", published_at: "2026-05-29", pdf: "older.pdf" },
    { slug: "newer", published_at: "2026-05-31", pdf: "newer.pdf" },
  ];
  const object = {
    body: new Blob(["pdf-bytes"]).stream(),
    size: 9,
  };
  const bucket = {
    async get(key) {
      calls.push(key);
      return object;
    },
  };

  const result = await readLatestPdfFromBucket(comics, bucket);

  assert.equal(result.comic.slug, "newer");
  assert.equal(result.object, object);
  assert.deepEqual(calls, ["comics/newer/newer.pdf"]);
});
