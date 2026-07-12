#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectComicAssets, requireComicAssets } from "./comic_media_assets.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_BASE_URL = "https://www.finalnotes.page";
const DEFAULT_CONCURRENCY = 6;

function parseArgs(argv) {
  const valueAfter = (flag) => {
    const index = argv.indexOf(flag);
    if (index === -1) return null;
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
    return value;
  };

  return {
    baseUrl: (valueAfter("--base-url") || process.env.FINALNOTES_SITE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    concurrency: Number(valueAfter("--concurrency") || process.env.FINALNOTES_BLOB_VERIFY_CONCURRENCY || DEFAULT_CONCURRENCY),
    requireAssets: !argv.includes("--allow-empty"),
    slug: valueAfter("--slug") || process.env.FINALNOTES_BLOB_VERIFY_SLUG || null,
  };
}

async function mapLimit(items, limit, worker) {
  const results = [];
  const workerCount = Math.max(1, Math.min(limit, items.length));
  const workers = Array.from({ length: workerCount }, async (_, workerIndex) => {
    for (let index = workerIndex; index < items.length; index += workerCount) {
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function verifyAsset(baseUrl, asset) {
  const url = `${baseUrl}/media/${asset.key}`;
  const response = await fetch(url, { method: "HEAD", cache: "no-store" });
  const contentType = response.headers.get("content-type") || "";
  const contentLength = Number(response.headers.get("content-length") || "0");

  if (!response.ok) {
    throw new Error(`${asset.key} returned HTTP ${response.status}`);
  }

  if (!contentType.toLowerCase().startsWith(asset.contentType.toLowerCase())) {
    throw new Error(`${asset.key} returned ${contentType || "no content-type"}, expected ${asset.contentType}`);
  }

  if (asset.size > 0 && contentLength > 0 && contentLength !== asset.size) {
    throw new Error(`${asset.key} returned ${contentLength} bytes, expected ${asset.size}`);
  }

  console.log(`[verified] ${asset.key} (${contentType}, ${contentLength || "unknown"} bytes)`);
  return asset.key;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(path.join(ROOT_DIR, "comics"))) throw new Error("comics directory not found");

  const assets = await collectComicAssets(ROOT_DIR, { slug: options.slug });
  if (options.requireAssets) requireComicAssets(assets, options.slug);

  await mapLimit(assets, options.concurrency, (asset) => verifyAsset(options.baseUrl, asset));
  console.log(`Verified ${assets.length} comic assets through ${options.baseUrl}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
