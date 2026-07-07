import assert from "node:assert/strict";
import test from "node:test";

import {
  citationPassage as presenterCitationPassage,
  firstImagePath as presenterFirstImagePath,
  mediaPath as presenterMediaPath,
} from "../lib/comic-presenters.js";

const comic = {
  slug: "sample-comic",
  pages: ["pages/01-sample-comic.jpg"],
  pdf: "sample-comic.pdf",
};

test("client presenters use the Blob-backed /media URL space", () => {
  assert.equal(presenterMediaPath(comic, comic.pdf), "/media/comics/sample-comic/sample-comic.pdf");
  assert.equal(presenterFirstImagePath(comic), "/media/comics/sample-comic/pages/01-sample-comic.jpg");
});

test("client presenter exposes authored citation passages without inventing legacy copy", () => {
  assert.equal(presenterCitationPassage({ citation_passage: "  Authored   source-grounded passage. " }), "Authored source-grounded passage.");
  assert.equal(presenterCitationPassage({}), "");
});
