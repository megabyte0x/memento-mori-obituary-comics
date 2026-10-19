#!/usr/bin/env node
// Resolve a comic subject to Wikidata and add exact, year-checked life dates.
//
// The local publishing agent runs this before `pnpm comic:publish` so every new
// comic carries `wikidata`, `birth_date`, and `death_date`:
//
//   node scripts/enrich_comic_entities.mjs --slug <slug>          # updates comics/<slug>/comic.json
//   node scripts/enrich_comic_entities.mjs --metadata-file x.json # updates that file
//   node scripts/enrich_comic_entities.mjs --catalog live.json --out data/comic-enrichment.json
//
// Only day-precision Gregorian dates whose year matches the comic's `years`
// field are accepted, so an ambiguous lookup never writes a wrong date.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const USER_AGENT = "finalnotes-entity-enrichment/1.0 (https://www.finalnotes.page/)";
const GREGORIAN = "http://www.wikidata.org/entity/Q1985727";
const HUMAN = "Q5";

async function getJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

export function wikidataIdFromUrls(urls = []) {
  for (const url of urls) {
    const match = String(url).match(/wikidata\.org\/(?:wiki|entity)\/(Q\d+)/);
    if (match) return match[1];
  }
  return "";
}

export function wikipediaTitleFromUrls(urls = []) {
  for (const url of urls) {
    const match = String(url).match(/^https:\/\/en\.wikipedia\.org\/wiki\/([^?#]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return "";
}

async function wikidataIdForWikipediaTitle(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&titles=${encodeURIComponent(title)}`;
  const data = await getJson(url);
  const page = Object.values(data?.query?.pages || {})[0];
  return page?.pageprops?.wikibase_item || "";
}

async function searchWikipediaTitle(person) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&srsearch=${encodeURIComponent(person)}`;
  const data = await getJson(url);
  return data?.query?.search?.[0]?.title || "";
}

function claimValues(entity, property) {
  return (entity?.claims?.[property] || [])
    .filter((claim) => claim.rank !== "deprecated")
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .filter(Boolean);
}

// Wikidata time values look like {time: "+1958-07-28T00:00:00Z", precision: 11, calendarmodel}.
export function exactDate(values = []) {
  for (const value of values) {
    if (value.precision !== 11 || value.calendarmodel !== GREGORIAN) continue;
    const match = String(value.time || "").match(/^\+(\d{4})-(\d{2})-(\d{2})T/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return "";
}

export function yearsFromLabel(years = "") {
  const values = String(years).match(/\d{3,4}/g) || [];
  return { birthYear: values.length > 1 ? values[0] : "", deathYear: values.at(-1) || "" };
}

export function datesFromEntity(entity, years = "") {
  const instanceOf = claimValues(entity, "P31").map((value) => value.id);
  if (!instanceOf.includes(HUMAN)) return null;
  const { birthYear, deathYear } = yearsFromLabel(years);
  const birth = exactDate(claimValues(entity, "P569"));
  const death = exactDate(claimValues(entity, "P570"));
  // A death year mismatch means the lookup found someone else.
  if (deathYear && death && !death.startsWith(deathYear)) return null;
  if (deathYear && !death && !claimValues(entity, "P570").some((value) => String(value.time).startsWith(`+${deathYear}`))) return null;
  return {
    ...(birth && (!birthYear || birth.startsWith(birthYear)) ? { birth_date: birth } : {}),
    ...(death ? { death_date: death } : {}),
  };
}

export async function enrichSubject({ person, years, sameAs = [], sources = [] }) {
  const urls = [...sameAs, ...sources.map((source) => source?.url).filter(Boolean)];
  const candidates = [];
  const direct = wikidataIdFromUrls(urls);
  if (direct) candidates.push(direct);
  const title = wikipediaTitleFromUrls(urls);
  if (title) candidates.push(await wikidataIdForWikipediaTitle(title));
  if (!candidates.filter(Boolean).length && person) {
    const found = await searchWikipediaTitle(person);
    if (found) candidates.push(await wikidataIdForWikipediaTitle(found));
  }

  for (const id of [...new Set(candidates.filter(Boolean))]) {
    const data = await getJson(`https://www.wikidata.org/wiki/Special:EntityData/${id}.json`);
    const entity = data?.entities?.[id] || Object.values(data?.entities || {})[0];
    const dates = datesFromEntity(entity, years);
    if (dates) return { wikidata: `https://www.wikidata.org/wiki/${id}`, ...dates };
  }
  return null;
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index === -1 ? null : argv[index + 1] || null;
}

async function enrichFile(filePath) {
  const comic = JSON.parse(readFileSync(filePath, "utf8"));
  const result = await enrichSubject(comic);
  if (!result) throw new Error(`Could not resolve ${comic.person} to a Wikidata person matching ${comic.years}`);
  const sameAs = [...new Set([...(comic.sameAs || []), result.wikidata])];
  const next = { ...comic, ...result, sameAs, birth_date: comic.birth_date || result.birth_date, death_date: comic.death_date || result.death_date };
  for (const key of ["birth_date", "death_date"]) if (!next[key]) delete next[key];
  writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`${comic.slug}: ${result.wikidata} ${next.birth_date || "?"} – ${next.death_date || "?"}`);
}

async function enrichCatalog(catalogPath, outPath) {
  const items = JSON.parse(readFileSync(catalogPath, "utf8"));
  const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {};
  for (const item of items) {
    try {
      const result = await enrichSubject(item);
      if (!result) {
        console.warn(`${item.slug}: no matching Wikidata person`);
        continue;
      }
      existing[item.slug] = { ...(existing[item.slug] || {}), ...result };
      console.log(`${item.slug}: ${result.wikidata} ${result.birth_date || "?"} – ${result.death_date || "?"}`);
    } catch (error) {
      console.warn(`${item.slug}: ${error.message}`);
    }
  }
  const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(outPath, `${JSON.stringify(sorted, null, 2)}\n`);
}

export async function main(argv = process.argv.slice(2)) {
  const catalog = valueAfter(argv, "--catalog");
  if (catalog) return enrichCatalog(path.resolve(catalog), path.resolve(valueAfter(argv, "--out") || path.join(ROOT, "data", "comic-enrichment.json")));
  const metadataFile = valueAfter(argv, "--metadata-file");
  const slug = valueAfter(argv, "--slug");
  if (!metadataFile && !slug) throw new Error("--slug, --metadata-file, or --catalog is required");
  return enrichFile(metadataFile ? path.resolve(metadataFile) : path.join(ROOT, "comics", slug, "comic.json"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
