import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { parseArgs, verifyPublishedComic } from "../scripts/publish_comic_to_r2.js";

const ROOT = process.cwd();
const read = (filePath) => readFileSync(path.join(ROOT, filePath), "utf8");

for (const scenario of [
  { name: "older comic with its canonical archive link", recent: false },
  { name: "recent comic with its complete introduction", recent: true, passage: true },
  { name: "recent comic missing its introduction", recent: true, error: /authored citation passage/ },
  { name: "comic missing its llms canonical link", missingLink: true, error: /llms.txt did not include https/ },
]) {
  test(`publication verification handles ${scenario.name}`, async (t) => {
    const baseUrl = "https://example.test";
    const comic = { slug: "reviewed-comic", title: "Reviewed Comic", citation_passage: "A reviewed introduction.", page_summaries: ["A reviewed panel."] };
    const canonical = `${baseUrl}/comics/${comic.slug}/`;
    const link = scenario.missingLink ? "https://example.test/comics/other/" : canonical;
    const llms = `# Archive\n\n## Latest issues\n${scenario.recent ? `- [Recent](${link}): ${scenario.passage ? comic.citation_passage : "Short description"}` : "- Another issue"}\n\n## Comics\n- [Comic](${link}): Short description.\n`;
    t.mock.method(globalThis, "fetch", async (url) => {
      const body = url === canonical
        ? `${comic.title}\n${comic.citation_passage}\n${comic.page_summaries[0]}`
        : url === `${baseUrl}/llms.txt` ? llms : canonical;
      return new Response(body);
    });
    if (scenario.error) {
      await assert.rejects(verifyPublishedComic({ baseUrl, comic }), scenario.error);
    } else {
      await verifyPublishedComic({ baseUrl, comic });
    }
  });
}

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
