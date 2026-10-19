import assert from "node:assert/strict";
import test from "node:test";

import enrichment from "../data/comic-enrichment.json" with { type: "json" };
import { anniversaryLabel, upcomingAnniversaries } from "../lib/anniversaries.js";
import { applyEnrichment } from "../lib/comic-enrichment.js";
import { getTheme, relatedComics } from "../lib/themes.js";

test("every enriched comic has known themes and ISO life dates", () => {
  for (const [slug, entry] of Object.entries(enrichment)) {
    assert.ok(entry.themes?.length, `${slug} has no themes`);
    for (const theme of entry.themes) assert.ok(getTheme(theme), `${slug} uses unknown theme ${theme}`);
    for (const key of ["birth_date", "death_date"]) {
      if (entry[key]) assert.match(entry[key], /^\d{4}-\d{2}-\d{2}$/, `${slug} ${key}`);
    }
    if (entry.birth_date && entry.death_date) assert.ok(entry.birth_date < entry.death_date, `${slug} dates out of order`);
  }
});

test("enrichment fills missing fields without overriding catalogue values", () => {
  const data = { ada: { birth_date: "1815-12-10", death_date: "1852-11-27", themes: ["scientists"], wikidata: "https://www.wikidata.org/wiki/Q7259" } };
  const [filled] = applyEnrichment([{ slug: "ada", sameAs: ["https://en.wikipedia.org/wiki/Ada_Lovelace"] }], data);
  assert.equal(filled.death_date, "1852-11-27");
  assert.deepEqual(filled.themes, ["scientists"]);
  assert.deepEqual(filled.sameAs, ["https://en.wikipedia.org/wiki/Ada_Lovelace", "https://www.wikidata.org/wiki/Q7259"]);

  const [authored] = applyEnrichment([{ slug: "ada", death_date: "1852-11-28", themes: ["women"], sameAs: ["https://www.wikidata.org/wiki/Q1"] }], data);
  assert.equal(authored.death_date, "1852-11-28");
  assert.deepEqual(authored.themes, ["women"]);
  assert.deepEqual(authored.sameAs, ["https://www.wikidata.org/wiki/Q1"]);
});

test("related comics rank by shared themes, then primary theme, then recency", () => {
  const comic = { slug: "a", themes: ["cancer", "writers"] };
  const comics = [
    comic,
    { slug: "writers-only", themes: ["writers"], published_at: "2026-10-01" },
    { slug: "both", themes: ["writers", "cancer"], published_at: "2026-01-01" },
    { slug: "cancer-only", themes: ["cancer"], published_at: "2026-01-01" },
    { slug: "unrelated", themes: ["war"], published_at: "2026-10-10" },
  ];
  assert.deepEqual(relatedComics(comics, comic).map((item) => item.slug), ["both", "cancer-only", "writers-only"]);
});

test("anniversaries wrap into next year and count the years being marked", () => {
  const comics = [
    { slug: "jan", person: "January Person", birth_date: "1900-01-05", death_date: "1950-06-01" },
    { slug: "dec", person: "December Person", death_date: "1991-12-24" },
  ];
  const items = upcomingAnniversaries(comics, { today: new Date("2026-12-20T15:00:00Z"), days: 30 });
  assert.deepEqual(items.map((item) => [item.comic.slug, item.kind, item.date, item.daysAway, item.years]), [
    ["dec", "death", "2026-12-24", 4, 35],
    ["jan", "birth", "2027-01-05", 16, 127],
  ]);
  assert.equal(anniversaryLabel(items[0]), "35th anniversary of December Person’s death · in 4 days");
  assert.equal(upcomingAnniversaries(comics, { today: new Date("2026-12-24T23:00:00Z"), days: 0 })[0].daysAway, 0);
});
