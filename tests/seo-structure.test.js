import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

test("visible FAQs do not emit ineligible FAQPage structured data", () => {
  const source = readFileSync(new URL("../components/faq-section.jsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /FAQPage|application\/ld\+json/);
  assert.match(source, /<details/);
  assert.match(source, /<summary>/);
});

test("the root layout advertises the RSS discovery feed", () => {
  const source = readFileSync(new URL("../app/layout.jsx", import.meta.url), "utf8");

  assert.match(source, /rel="alternate"/);
  assert.match(source, /type="application\/rss\+xml"/);
  assert.match(source, /href="\/feed\.xml"/);
});

test("resource schemas use valid textual keywords and truthful dates", () => {
  const appDirectory = new URL("../app/", import.meta.url);
  const pageSources = readdirSync(appDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => new URL(`../app/${entry.name}/page.jsx`, import.meta.url))
    .filter((url) => {
      try {
        readFileSync(url, "utf8");
        return true;
      } catch {
        return false;
      }
    })
    .map((url) => readFileSync(url, "utf8"))
    .join("\n");

  assert.doesNotMatch(pageSources, /about:\s*\[/);
  assert.doesNotMatch(pageSources, /dateModified:\s*latestDate/);
});

test("resource breadcrumb schema contains no linkless middle crumb", () => {
  const source = readFileSync(new URL("../components/resource-layout.jsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /position:\s*activeCategory\s*\?\s*3/);
  assert.match(source, /position:\s*2/);
});

test("Next responses suppress framework disclosure and carry baseline security headers", () => {
  const source = readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8");

  assert.match(source, /poweredByHeader:\s*false/);
  assert.match(source, /X-Content-Type-Options/);
  assert.match(source, /Referrer-Policy/);
  assert.match(source, /Permissions-Policy/);
  assert.match(source, /X-Frame-Options/);
});

test("production typography is self-hosted through Next instead of a render-blocking CSS import", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../app/layout.jsx", import.meta.url), "utf8");

  assert.doesNotMatch(css, /fonts\.googleapis\.com/);
  assert.match(layout, /next\/font\/google/);
  assert.match(layout, /Cinzel/);
  assert.match(layout, /Cormorant_Garamond/);
  assert.match(layout, /Plus_Jakarta_Sans/);
});
