import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const read = (filePath) => readFileSync(path.join(ROOT, filePath), "utf8");

test("publish command uploads media and metadata without invoking a Worker deploy", () => {
  const scriptPath = path.join(ROOT, "scripts/publish_comic_to_r2.js");
  assert.equal(existsSync(scriptPath), true);
  const source = read("scripts/publish_comic_to_r2.js");
  assert.match(source, /api\/admin\/comic-publish/);
  assert.doesNotMatch(source, /pnpm deploy|opennextjs-cloudflare deploy/);
});
