// Backfill `sameAs` entity links (Wikipedia + Wikidata) onto every comic in
// comics.json. Each comic subject is a public figure with a stable Wikidata
// entity; linking the Person schema to Wikipedia and Wikidata is a strong
// Knowledge Graph and AI-citation (GEO) signal.
//
// Run after adding a new comic:  node scripts/add_entity_links.mjs
//
// Canonical titles and Wikidata QIDs are resolved live from the Wikipedia API
// (with redirect resolution) so the links are authoritative, never guessed.
// Pass --check to verify without writing (exits non-zero if any are missing).

import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMICS_JSON = path.join(ROOT, "comics.json");
const checkOnly = process.argv.includes("--check");

function wikipediaLookup(person) {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&redirects=1" +
    "&prop=pageprops&ppprop=wikibase_item&format=json&titles=" +
    encodeURIComponent(person);
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "finalnotes-seo/1.0 (https://www.finalnotes.page)" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const page = Object.values(JSON.parse(data).query.pages)[0];
            resolve({
              title: page.title,
              qid: page.pageprops && page.pageprops.wikibase_item,
              missing: page.missing !== undefined,
            });
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

const comics = JSON.parse(fs.readFileSync(COMICS_JSON, "utf8"));
let updated = 0;
const problems = [];

for (const comic of comics) {
  const entity = await wikipediaLookup(comic.person);
  if (entity.missing || !entity.qid) {
    problems.push(`${comic.slug}: no Wikidata entity for "${comic.person}"`);
    continue;
  }
  const sameAs = [
    `https://en.wikipedia.org/wiki/${encodeURIComponent(entity.title.replace(/ /g, "_"))}`,
    `https://www.wikidata.org/wiki/${entity.qid}`,
  ];
  if (JSON.stringify(comic.sameAs) !== JSON.stringify(sameAs)) {
    comic.sameAs = sameAs;
    updated += 1;
  }
  console.log(`${comic.slug.padEnd(40)} -> ${entity.title} (${entity.qid})`);
}

if (problems.length) {
  console.error("\nUnresolved subjects:\n" + problems.map((p) => `  - ${p}`).join("\n"));
}

if (checkOnly) {
  process.exit(problems.length ? 1 : 0);
}

if (updated) {
  fs.writeFileSync(COMICS_JSON, JSON.stringify(comics, null, 2) + "\n");
  console.log(`\nUpdated sameAs on ${updated} comic(s).`);
} else {
  console.log("\nAll comics already have current entity links.");
}
