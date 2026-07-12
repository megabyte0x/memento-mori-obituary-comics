import { existsSync, readFileSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { contentTypeForBlobPath } from "../lib/blob-media.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UPLOADABLE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".pdf"]);

export function loadEnvFile(filePath = path.join(ROOT_DIR, ".env.local")) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

export function comicAssetR2Key(rootDir, filePath) {
  const relativePath = path.relative(rootDir, filePath).split(path.sep).join("/");
  if (!relativePath.startsWith("comics/") || relativePath.includes("../")) {
    throw new Error(`Comic asset must be inside ${path.join(rootDir, "comics")}`);
  }
  return relativePath;
}

async function walkFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

export async function collectComicAssets(rootDir = ROOT_DIR, { slug = null } = {}) {
  const comicsDir = path.join(rootDir, "comics");
  const scanDir = slug ? path.join(comicsDir, slug) : comicsDir;
  if (!existsSync(scanDir)) {
    throw new Error(slug
      ? `Comic slug not found: ${path.join("comics", slug)}`
      : `Comics directory not found: ${comicsDir}`);
  }

  const assets = [];
  for (const filePath of await walkFiles(scanDir)) {
    if (!UPLOADABLE_EXTENSIONS.has(path.extname(filePath).toLowerCase())) continue;
    const key = comicAssetR2Key(rootDir, filePath);
    const fileStat = await stat(filePath);
    assets.push({ key, contentType: contentTypeForBlobPath(key), filePath, size: fileStat.size });
  }
  return assets.sort((a, b) => a.key.localeCompare(b.key));
}

export function requireComicAssets(assets, slug = null) {
  if (assets.length > 0) return assets;
  throw new Error(slug
    ? `No uploadable comic assets found for slug: ${slug}`
    : "No uploadable comic assets found");
}
