import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { sourceItems } from "../lib/comics.js";
import { comicAssetBlobPath, comicMediaPath } from "../lib/media-paths.js";

const ROOT = process.cwd();
const comics = JSON.parse(readFileSync(path.join(ROOT, "comics.json"), "utf8"));

test("comic archive data is ordered newest first", () => {
  for (let index = 1; index < comics.length; index += 1) {
    assert.ok(comics[index - 1].published_at >= comics[index].published_at);
  }
});

test("latest three comics satisfy the GEO publishing contract in both metadata stores", () => {
  for (const comic of comics.slice(0, 3)) {
    const wordCount = String(comic.citation_passage || "").trim().split(/\s+/).filter(Boolean).length;
    assert.ok(wordCount >= 134 && wordCount <= 167, `${comic.slug} citation passage has ${wordCount} words`);
    assert.equal(comic.page_summaries?.length, comic.pages.length, `${comic.slug} needs one caption per page`);
    assert.ok(
      comic.sameAs?.length > 0 && comic.sameAs.every((url) => URL.canParse(url) && new URL(url).protocol === "https:"),
      `${comic.slug} needs absolute HTTPS entity links`,
    );

    const perComic = JSON.parse(readFileSync(path.join(ROOT, "comics", comic.slug, "comic.json"), "utf8"));
    assert.deepEqual(perComic, comic, `${comic.slug} metadata stores must stay synchronized`);
  }
});

test("comic data has required metadata and stable Blob-backed media paths", () => {
  for (const comic of comics) {
    assert.ok(comic.slug, "comic slug is required");
    assert.ok(comic.person, `${comic.slug} person is required`);
    assert.ok(comic.title, `${comic.slug} title is required`);
    assert.ok(comic.published_at, `${comic.slug} published_at is required`);
    assert.ok(Array.isArray(comic.pages) && comic.pages.length > 0, `${comic.slug} needs pages`);

    for (const page of comic.pages) {
      assert.equal(
        comicMediaPath(comic, page),
        `/media/comics/${comic.slug}/${page}`,
        `${comic.slug} page should map to the /media URL space`,
      );
      assert.equal(
        comicAssetBlobPath(comic, page),
        `comics/${comic.slug}/${page}`,
        `${comic.slug} page should map to a private Blob key`,
      );
    }

    if (comic.pdf) {
      assert.equal(comicMediaPath(comic, comic.pdf), `/media/comics/${comic.slug}/${comic.pdf}`);
    }

    if (comic.contact_sheet) {
      assert.equal(comicMediaPath(comic, comic.contact_sheet), `/media/comics/${comic.slug}/${comic.contact_sheet}`);
    }
  }
});

test("sourceItems extracts embedded URLs from malformed source labels", () => {
  const normalized = sourceItems({
    sources: [
      "United States Holocaust Memorial Museum: https://encyclopedia.ushmm.org/content/en/article/elie-wiesel",
      {
        name: "Nobel Prize: https://www.nobelprize.org/prizes/peace/1986/wiesel/biographical/",
        url: "",
      },
      {
        name: "",
        url: "https://www.britannica.com/biography/Elie-Wiesel",
      },
    ],
  });

  assert.deepEqual(normalized, [
    {
      name: "United States Holocaust Memorial Museum",
      url: "https://encyclopedia.ushmm.org/content/en/article/elie-wiesel",
    },
    {
      name: "Nobel Prize",
      url: "https://www.nobelprize.org/prizes/peace/1986/wiesel/biographical/",
    },
    {
      name: "https://www.britannica.com/biography/Elie-Wiesel",
      url: "https://www.britannica.com/biography/Elie-Wiesel",
    },
  ]);
});
