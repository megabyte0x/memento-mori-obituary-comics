#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import comics from "../comics.json" with { type: "json" };
import { sha256Hex, signBlobUpload } from "../lib/blob-upload-auth.js";
import { assertSafeBlobPath, contentTypeForBlobPath } from "../lib/blob-media.js";

const DEFAULT_SOURCE_BASE = "https://www.finalnotes.page";
const DEFAULT_PRIVATE_KEY = path.join(homedir(), ".config", "finalnotes", "blob-upload-ed25519.pem");

export function collectComicMediaKeys(items) {
  const keys = [];
  for (const comic of items) {
    for (const page of comic.pages || []) keys.push(`comics/${comic.slug}/${page}`);
    if (comic.pdf) keys.push(`comics/${comic.slug}/${comic.pdf}`);
    if (comic.contact_sheet) keys.push(`comics/${comic.slug}/${comic.contact_sheet}`);
  }
  return [...new Set(keys)].map(assertSafeBlobPath).sort((a, b) => a.localeCompare(b));
}

export async function migrateMediaObject({ fetchImpl = fetch, key, privateKeyPem, sourceBase, targetBase }) {
  const sourceResponse = await fetchImpl(`${sourceBase}/media/${key}`);
  if (!sourceResponse.ok) throw new Error(`Source ${key} returned HTTP ${sourceResponse.status}`);

  const bytes = Buffer.from(await sourceResponse.arrayBuffer());
  const contentType = contentTypeForBlobPath(key);
  const metadata = {
    blobPath: key,
    contentType,
    sha256: sha256Hex(bytes),
    size: bytes.length,
    timestamp: Date.now(),
  };
  const signatureBase64 = signBlobUpload({ metadata, privateKeyPem });
  const uploadResponse = await fetchImpl(`${targetBase}/api/admin/blob-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...metadata,
      dataBase64: bytes.toString("base64"),
      signatureBase64,
    }),
  });
  if (!uploadResponse.ok) {
    throw new Error(`Target upload ${key} returned HTTP ${uploadResponse.status}: ${await uploadResponse.text()}`);
  }

  const verifyResponse = await fetchImpl(`${targetBase}/media/${key}`, { method: "HEAD" });
  const verifiedSize = Number(verifyResponse.headers.get("content-length"));
  if (!verifyResponse.ok || verifiedSize !== bytes.length) {
    throw new Error(`Target verification failed for ${key}: HTTP ${verifyResponse.status}, ${verifiedSize} bytes`);
  }

  return { bytes: bytes.length, key, sha256: metadata.sha256 };
}

async function mapLimit(items, concurrency, worker) {
  const results = new Array(items.length);
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async (_, runner) => {
    for (let index = runner; index < items.length; index += concurrency) {
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

async function main() {
  const args = process.argv.slice(2);
  const targetBase = (valueAfter(args, "--target") || process.env.FINALNOTES_TARGET_URL || "").replace(/\/+$/, "");
  if (!targetBase) throw new Error("--target or FINALNOTES_TARGET_URL is required");
  const sourceBase = (valueAfter(args, "--source") || DEFAULT_SOURCE_BASE).replace(/\/+$/, "");
  const privateKeyPath = valueAfter(args, "--private-key") || DEFAULT_PRIVATE_KEY;
  const concurrency = Number(valueAfter(args, "--concurrency") || 4);
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 12) {
    throw new Error("--concurrency must be an integer from 1 to 12");
  }

  const privateKeyPem = readFileSync(privateKeyPath, "utf8");
  const keys = collectComicMediaKeys(comics);
  let migratedBytes = 0;
  const results = await mapLimit(keys, concurrency, async (key, index) => {
    const result = await migrateMediaObject({ key, privateKeyPem, sourceBase, targetBase });
    migratedBytes += result.bytes;
    console.log(`[${index + 1}/${keys.length}] ${key} (${result.bytes} bytes, ${result.sha256})`);
    return result;
  });
  console.log(`Migrated and verified ${results.length} R2 objects (${migratedBytes} bytes).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
