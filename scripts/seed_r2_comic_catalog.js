#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { CATALOG_OBJECT_KEY, normalizeCatalog } from "../lib/comic-catalog.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUCKET_NAME = "finalnotes-comics";

export function catalogJsonForSeed(comics) {
  return `${JSON.stringify(normalizeCatalog(comics), null, 2)}\n`;
}

export function wranglerSeedArgs(manifestPath) {
  return [
    "exec",
    "wrangler",
    "r2",
    "object",
    "put",
    `${BUCKET_NAME}/${CATALOG_OBJECT_KEY}`,
    "--file",
    manifestPath,
    "--remote",
    "--content-type",
    "application/json",
  ];
}

export function main() {
  const comics = JSON.parse(readFileSync(path.join(ROOT_DIR, "comics.json"), "utf8"));
  const directory = mkdtempSync(path.join(tmpdir(), "finalnotes-catalog-"));
  const manifestPath = path.join(directory, "comics.json");

  try {
    writeFileSync(manifestPath, catalogJsonForSeed(comics), "utf8");
    const result = spawnSync("pnpm", wranglerSeedArgs(manifestPath), { stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exitCode = result.status || 1;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
