import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { parseArgs } from "../scripts/publish_comic_to_r2.js";

const ROOT = process.cwd();
const read = (filePath) => readFileSync(path.join(ROOT, filePath), "utf8");

test("publish command uploads media and metadata without invoking a Worker deploy", () => {
  const scriptPath = path.join(ROOT, "scripts/publish_comic_to_r2.js");
  assert.equal(existsSync(scriptPath), true);
  const source = read("scripts/publish_comic_to_r2.js");
  assert.match(source, /api\/admin\/comic-publish/);
  assert.match(source, /validatePublishableComic/);
  assert.match(source, /citation_passage/);
  assert.match(source, /page_summaries/);
  assert.doesNotMatch(source, /pnpm deploy|opennextjs-cloudflare deploy/);
});

test("publish command supports signed metadata-only corrections for R2-resident comics", () => {
  assert.deepEqual(
    parseArgs([
      "--slug", "ada-lovelace-notes-before-night",
      "--metadata-file", "/tmp/ada.json",
      "--metadata-only",
      "--base-url", "https://www.finalnotes.page/",
      "--private-key", "/tmp/key.pem",
    ]),
    {
      slug: "ada-lovelace-notes-before-night",
      baseUrl: "https://www.finalnotes.page",
      privateKeyPath: "/tmp/key.pem",
      metadataFile: "/tmp/ada.json",
      metadataOnly: true,
    },
  );
  assert.throws(
    () => parseArgs(["--slug", "ada-lovelace-notes-before-night", "--metadata-only"]),
    /metadata-file is required/i,
  );
});
