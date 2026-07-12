#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { canonicalBlobUploadMessage, sha256Hex, signBlobUpload } from "../lib/blob-upload-auth.js";
import { collectComicAssets, loadEnvFile, requireComicAssets } from "./comic_media_assets.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_BASE_URL = "https://www.finalnotes.page";
const DEFAULT_PRIVATE_KEY_PATH = path.join(homedir(), ".config", "finalnotes", "blob-upload-ed25519.pem");

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
    dryRun: argv.includes("--dry-run"),
    privateKeyPath: valueAfter("--private-key") || process.env.FINALNOTES_BLOB_UPLOAD_PRIVATE_KEY_PATH || DEFAULT_PRIVATE_KEY_PATH,
    requireAssets: argv.includes("--require-assets"),
    slug: valueAfter("--slug") || null,
  };
}

function loadPrivateKey(options) {
  if (process.env.FINALNOTES_BLOB_UPLOAD_PRIVATE_KEY) {
    return process.env.FINALNOTES_BLOB_UPLOAD_PRIVATE_KEY.replace(/\\n/g, "\n");
  }
  return readFileSync(options.privateKeyPath, "utf8");
}

async function uploadAsset({ asset, baseUrl, privateKeyPem }) {
  const buffer = readFileSync(asset.filePath);
  const metadata = {
    blobPath: asset.key,
    contentType: asset.contentType,
    sha256: sha256Hex(buffer),
    size: buffer.length,
    timestamp: Date.now(),
  };

  const signatureBase64 = signBlobUpload({ metadata, privateKeyPem });
  const response = await fetch(`${baseUrl}/api/admin/blob-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...metadata,
      dataBase64: buffer.toString("base64"),
      signatureBase64,
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await response.json());
    } catch {
      detail = await response.text();
    }
    throw new Error(`Live R2 upload failed for ${asset.key}: HTTP ${response.status} ${detail}`);
  }

  console.log(`[live-uploaded] ${asset.key} (${asset.contentType}, ${buffer.length} bytes)`);
  return canonicalBlobUploadMessage(metadata);
}

async function main() {
  loadEnvFile();
  const options = parseArgs(process.argv.slice(2));
  const assets = await collectComicAssets(ROOT_DIR, { slug: options.slug });

  if (options.requireAssets) requireComicAssets(assets, options.slug);

  if (options.dryRun) {
    for (const asset of assets) {
      console.log(`[dry-run live-upload] ${asset.key} (${asset.contentType}, ${asset.size} bytes)`);
    }
    console.log(`Found ${assets.length} comic assets for live R2 upload.`);
    return;
  }

  const privateKeyPem = loadPrivateKey(options);
  for (const asset of assets) {
    await uploadAsset({ asset, baseUrl: options.baseUrl, privateKeyPem });
  }
  console.log(`Uploaded ${assets.length} comic assets to live R2 via ${options.baseUrl}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
