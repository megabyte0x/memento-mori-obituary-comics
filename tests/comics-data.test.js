import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import * as comicsModule from "../lib/comics.js";
import { comicAssetBlobPath, comicMediaPath } from "../lib/media-paths.js";

const { sourceItems } = comicsModule;

const ROOT = process.cwd();
const comics = JSON.parse(readFileSync(path.join(ROOT, "comics.json"), "utf8"));

test("comic archive data is ordered newest first", () => {
  for (let index = 1; index < comics.length; index += 1) {
    assert.ok(comics[index - 1].published_at >= comics[index].published_at);
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

test("selectResearchGuideComics chooses a fixed case study, a distinct latest story, and four remaining stories", () => {
  assert.equal(typeof comicsModule.selectResearchGuideComics, "function");

  const items = [
    { slug: "latest" },
    { slug: "featured" },
    { slug: "third" },
    { slug: "fourth" },
    { slug: "fifth" },
    { slug: "sixth" },
    { slug: "seventh" },
  ];
  const selection = comicsModule.selectResearchGuideComics(items, "featured");

  assert.equal(selection.featured.slug, "featured");
  assert.equal(selection.latest.slug, "latest");
  assert.deepEqual(selection.remaining.map((item) => item.slug), ["third", "fourth", "fifth", "sixth"]);
});

test("selectResearchGuideComics falls back to the first story when the featured slug is missing", () => {
  const items = [{ slug: "latest" }, { slug: "second" }, { slug: "third" }];
  const selection = comicsModule.selectResearchGuideComics(items, "missing");

  assert.equal(selection.featured.slug, "latest");
  assert.equal(selection.latest.slug, "second");
  assert.deepEqual(selection.remaining.map((item) => item.slug), ["third"]);
});

test("selectResearchGuideComics omits a duplicate latest card when only one story exists", () => {
  const only = { slug: "only" };

  assert.deepEqual(comicsModule.selectResearchGuideComics([only], "only"), {
    featured: only,
    latest: null,
    remaining: [],
  });
});

test("selectResearchGuideComics returns an empty selection for an empty archive", () => {
  assert.deepEqual(comicsModule.selectResearchGuideComics([], "featured"), {
    featured: null,
    latest: null,
    remaining: [],
  });
});
