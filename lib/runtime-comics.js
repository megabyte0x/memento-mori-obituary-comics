import { getCloudflareContext } from "@opennextjs/cloudflare";

import rawComics from "../comics.json" with { type: "json" };
import { CATALOG_OBJECT_KEY, normalizeCatalog } from "./comic-catalog.js";

function currentContext() {
  try {
    return getCloudflareContext();
  } catch {
    return null;
  }
}

export async function loadRuntimeComics(options = {}) {
  const context = Object.hasOwn(options, "bucket") ? null : currentContext();
  const bucket = Object.hasOwn(options, "bucket") ? options.bucket : context?.env?.COMICS_BUCKET;
  const environment = options.environment || process.env.NODE_ENV || "development";
  const seed = options.seed || rawComics;

  if (!bucket) {
    if (environment !== "production") return normalizeCatalog(seed);
    throw new Error("Comic catalogue manifest is unavailable");
  }

  const object = await bucket.get(CATALOG_OBJECT_KEY);
  if (!object?.body) throw new Error("Comic catalogue manifest is unavailable");
  return normalizeCatalog(await object.json());
}
