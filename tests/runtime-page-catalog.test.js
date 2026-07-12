import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const read = (filePath) => readFileSync(path.join(ROOT, filePath), "utf8");

test("comic route no longer blocks newly published slugs with generateStaticParams", () => {
  const reader = read("app/comics/[slug]/page.jsx");
  assert.doesNotMatch(reader, /generateStaticParams|dynamicParams\s*=\s*false/);
  assert.match(reader, /await loadRuntimeComics\(/);
});

test("sitemap and llms routes await the runtime catalogue", () => {
  assert.match(read("app/sitemap.js"), /async function sitemap\(\).*await loadRuntimeComics/s);
  assert.match(read("app/llms.txt/route.js"), /async function GET\(\).*await loadRuntimeComics/s);
});

test("catalogue-dependent pages load comics from the runtime reader", () => {
  const pages = [
    "app/page.jsx",
    "app/about/page.jsx",
    "app/obituary-stories/page.jsx",
    "app/obituary-research-guide/page.jsx",
    "app/what-are-obituary-comics/page.jsx",
  ];

  for (const filePath of pages) {
    const source = read(filePath);
    assert.match(source, /loadRuntimeComics/);
    assert.match(source, /await loadRuntimeComics\(/);
  }
});
