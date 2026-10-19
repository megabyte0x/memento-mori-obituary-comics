import assert from "node:assert/strict";
import test from "node:test";

import { datesFromEntity } from "../scripts/enrich_comic_entities.mjs";
import { foregroundWidth, parseShareCardFile, serveShareCard } from "../lib/share-card.js";

const GREGORIAN = "http://www.wikidata.org/entity/Q1985727";
const JULIAN = "http://www.wikidata.org/entity/Q1985786";

function entity({ birth, death, human = true, precision = 11, calendar = GREGORIAN }) {
  const time = (value) => [{ rank: "normal", mainsnak: { datavalue: { value: { time: `+${value}T00:00:00Z`, precision, calendarmodel: calendar } } } }];
  return {
    claims: {
      P31: [{ mainsnak: { datavalue: { value: { id: human ? "Q5" : "Q4167410" } } } }],
      ...(birth ? { P569: time(birth) } : {}),
      ...(death ? { P570: time(death) } : {}),
    },
  };
}

test("Wikidata dates are accepted only for a human whose death year matches the comic", () => {
  assert.deepEqual(datesFromEntity(entity({ birth: "1958-07-28", death: "1981-06-28" }), "1958–1981"), {
    birth_date: "1958-07-28",
    death_date: "1981-06-28",
  });
  // Same name, different person.
  assert.equal(datesFromEntity(entity({ birth: "1958-07-28", death: "1999-06-28" }), "1958–1981"), null);
  assert.equal(datesFromEntity(entity({ death: "1981-06-28", human: false }), "1958–1981"), null);
  // Year-precision and Julian dates are never written as exact days.
  assert.deepEqual(datesFromEntity(entity({ death: "1981-00-00", precision: 9 }), "1981"), {});
  assert.deepEqual(datesFromEntity(entity({ death: "1616-04-22", calendar: JULIAN }), "1547–1616"), {});
});

test("share card paths accept only slug.jpg", () => {
  assert.equal(parseShareCardFile("terry-fox.jpg"), "terry-fox");
  assert.equal(parseShareCardFile("../secret.jpg"), "");
  assert.equal(parseShareCardFile("terry-fox.png"), "");
  assert.equal(foregroundWidth({ pages: ["p.jpg"], page_dimensions: { "p.jpg": [720, 1280] } }), 354);
});

function fakeBucket(bytes = "cover-bytes") {
  return {
    async get(key) {
      this.key = key;
      return { body: new Response(bytes).body, httpMetadata: { contentType: "image/jpeg" } };
    },
  };
}

const comic = { slug: "terry-fox", pages: ["pages/01.jpg"], page_dimensions: { "pages/01.jpg": [720, 1280] } };

test("share card composes the cover over a 1200x630 backdrop", async () => {
  const calls = [];
  const images = {
    input(stream) {
      const chain = {
        transform(options) { calls.push(["transform", options]); return chain; },
        draw(overlay, options) { calls.push(["draw", options, overlay instanceof ReadableStream]); return chain; },
        async output(options) { calls.push(["output", options]); return { response: () => new Response("composed") }; },
      };
      return chain;
    },
  };
  const bucket = fakeBucket();
  const response = await serveShareCard({ comic, bucket, images });
  assert.equal(bucket.key, "comics/terry-fox/pages/01.jpg");
  assert.equal(response.headers.get("X-Finalnotes-Share-Card"), "images-binding");
  assert.equal(await response.text(), "composed");
  const backdrop = calls.find(([kind, options]) => kind === "transform" && options.width === 1200);
  assert.equal(backdrop[1].height, 630);
  assert.deepEqual(calls.find(([kind]) => kind === "draw").slice(1), [{ top: 0, left: 423 }, true]);
});

test("share card falls back to the original cover when composition fails", async () => {
  const images = { input() { throw new Error("binding down"); } };
  const originalError = console.error;
  console.error = () => {};
  try {
    const response = await serveShareCard({ comic, bucket: fakeBucket("original"), images });
    assert.equal(response.headers.get("X-Finalnotes-Share-Card"), "original-fallback");
    assert.equal(await response.text(), "original");
  } finally {
    console.error = originalError;
  }
  assert.equal((await serveShareCard({ comic: null, bucket: fakeBucket(), images })).status, 404);
});
