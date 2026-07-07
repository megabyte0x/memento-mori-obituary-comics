import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();

function source(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

test("research guide places the story bridge before the research process and uses the deduplicated remainder", () => {
  const page = source("app/obituary-research-guide/page.jsx");
  const bridgePosition = page.indexOf("<ResourceStoryBridge");
  const processPosition = page.indexOf('aria-labelledby="research-steps"');

  assert.ok(page.includes('selectResearchGuideComics(comics, "virginia-hall-limping-lady")'));
  assert.ok(bridgePosition >= 0, "research guide should render ResourceStoryBridge");
  assert.ok(bridgePosition < processPosition, "story bridge should appear before the research process");
  assert.ok(page.includes("remaining.map((comic) =>"), "bottom story list should use the deduplicated remainder");
});

test("story bridge has a dedicated Mixpanel surface", () => {
  const analytics = source("components/mixpanel-analytics.jsx");

  assert.ok(
    analytics.includes('[".resource-story-bridge", "resource_story_bridge"]'),
    "bridge clicks should be classified separately from generic page clicks",
  );
});

test("featured story CTA follows the selected comic instead of hardcoding the preferred case study", () => {
  const bridge = source("components/resource-story-bridge.jsx");

  assert.ok(bridge.includes('cta: (comic) => `Read the ${comic.person} obituary comic`'));
  assert.ok(!bridge.includes('cta: "Read the Virginia Hall obituary comic"'));
});
