#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { canonicalJson, validatePublishableComic } from "../lib/comic-catalog.js";
import { sha256Hex, signComicPublish } from "../lib/blob-upload-auth.js";
import { loadEnvFile } from "./comic_media_assets.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_BASE_URL = "https://www.finalnotes.page";
const DEFAULT_PRIVATE_KEY_PATH = path.join(homedir(), ".config", "finalnotes", "blob-upload-ed25519.pem");

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  if (index === -1) return null;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

export function parseArgs(argv) {
  const slug = valueAfter(argv, "--slug");
  if (!slug) throw new Error("--slug is required");
  const metadataFile = valueAfter(argv, "--metadata-file");
  const metadataOnly = argv.includes("--metadata-only");
  if (metadataOnly && !metadataFile) throw new Error("--metadata-file is required with --metadata-only");
  return {
    slug,
    baseUrl: (valueAfter(argv, "--base-url") || process.env.FINALNOTES_SITE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    privateKeyPath: valueAfter(argv, "--private-key") || process.env.FINALNOTES_BLOB_UPLOAD_PRIVATE_KEY_PATH || DEFAULT_PRIVATE_KEY_PATH,
    metadataFile,
    metadataOnly,
  };
}

export function publicationMetadata(comic, timestamp = Date.now()) {
  const metadataJson = canonicalJson(comic);
  return {
    slug: comic.slug,
    metadataSha256: sha256Hex(Buffer.from(metadataJson)),
    metadataSize: Buffer.byteLength(metadataJson),
    timestamp,
  };
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT_DIR, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed`);
}

function loadPrivateKey(privateKeyPath) {
  if (process.env.FINALNOTES_BLOB_UPLOAD_PRIVATE_KEY) {
    return process.env.FINALNOTES_BLOB_UPLOAD_PRIVATE_KEY.replace(/\\n/g, "\n");
  }
  return readFileSync(privateKeyPath, "utf8");
}

function loadComic(slug, metadataFile = null) {
  const filePath = metadataFile
    ? path.resolve(metadataFile)
    : path.join(ROOT_DIR, "comics", slug, "comic.json");
  const comic = validatePublishableComic(JSON.parse(readFileSync(filePath, "utf8")));
  if (comic.slug !== slug) throw new Error("--slug does not match the comic metadata file");
  return comic;
}

async function assertResponse(response, label) {
  if (response.ok) return response;
  let detail = "";
  try {
    detail = JSON.stringify(await response.json());
  } catch {
    detail = await response.text();
  }
  throw new Error(`${label} returned HTTP ${response.status}${detail ? ` ${detail}` : ""}`);
}

export async function verifyPublishedComic({ baseUrl, comic }) {
  const readerUrl = `${baseUrl}/comics/${comic.slug}/`;
  const reader = await assertResponse(await fetch(readerUrl, { cache: "no-store" }), "Published reader");
  const readerBody = await reader.text();
  if (!readerBody.includes(comic.title)) throw new Error("Published reader did not include the comic title");
  if (!readerBody.includes(comic.citation_passage)) {
    throw new Error("Published reader did not include the authored citation passage");
  }
  for (const summary of comic.page_summaries) {
    if (!readerBody.includes(summary)) throw new Error("Published reader did not include every page summary");
  }

  const canonicalUrl = `${baseUrl}/comics/${comic.slug}/`;
  for (const [label, url] of [
    ["Homepage", `${baseUrl}/`],
    ["Sitemap", `${baseUrl}/sitemap.xml`],
    ["llms.txt", `${baseUrl}/llms.txt`],
  ]) {
    const response = await assertResponse(await fetch(url, { cache: "no-store" }), label);
    const body = await response.text();
    if (!body.includes(canonicalUrl)) {
      throw new Error(`${label} did not include ${canonicalUrl}`);
    }
    if (label === "llms.txt" && !body.includes(comic.citation_passage)) {
      throw new Error("llms.txt did not include the authored citation passage");
    }
  }
}

export async function main(argv = process.argv.slice(2)) {
  loadEnvFile();
  const options = parseArgs(argv);
  if (!options.metadataOnly) run("python3", ["scripts/add_comic.py", "--render-only"]);
  const comic = loadComic(options.slug, options.metadataFile);
  if (!options.metadataOnly) {
    const pnpmArgs = ["--", "--slug", comic.slug, "--require-assets", "--base-url", options.baseUrl];
    run("pnpm", ["run", "r2:upload-live:dry-run", ...pnpmArgs]);
    run("pnpm", ["run", "r2:upload-live", ...pnpmArgs]);
    run("pnpm", ["run", "r2:verify-live", "--", "--slug", comic.slug, "--base-url", options.baseUrl]);
  }

  const metadata = publicationMetadata(comic);
  const response = await assertResponse(await fetch(`${options.baseUrl}/api/admin/comic-publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      comic,
      ...metadata,
      signatureBase64: signComicPublish({ metadata, privateKeyPem: loadPrivateKey(options.privateKeyPath) }),
    }),
  }), "Comic publication");
  const result = await response.json();
  if (!result.ok || result.slug !== comic.slug) throw new Error("Comic publication returned an unexpected response");

  await verifyPublishedComic({ baseUrl: options.baseUrl, comic });
  console.log(`${options.metadataOnly ? "Updated metadata for" : "Published"} ${comic.slug} in R2 without a Worker deployment.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
