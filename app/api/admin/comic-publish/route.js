import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  CATALOG_OBJECT_KEY,
  canonicalJson,
  declaredComicAssetKeys,
  mergeComic,
  validateComic,
} from "../../../../lib/comic-catalog.js";
import {
  assertFreshTimestamp,
  DEFAULT_BLOB_UPLOAD_PUBLIC_KEY,
  sha256Hex,
  verifyComicPublishSignature,
} from "../../../../lib/blob-upload-auth.js";

function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}

function publicKeyPems(env) {
  return [...new Set([
    env.FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY,
    DEFAULT_BLOB_UPLOAD_PUBLIC_KEY,
  ].filter(Boolean))];
}

function publicationMetadata(body) {
  const comic = validateComic(body?.comic);
  const metadataJson = canonicalJson(body.comic);
  const metadata = {
    slug: String(body?.slug || ""),
    metadataSha256: String(body?.metadataSha256 || ""),
    metadataSize: Number(body?.metadataSize),
    timestamp: Number(body?.timestamp),
  };

  if (metadata.slug !== comic.slug) throw new Error("Publication slug does not match comic metadata");
  if (!/^[a-f0-9]{64}$/i.test(metadata.metadataSha256)) throw new Error("Invalid comic metadata digest");
  if (!Number.isSafeInteger(metadata.metadataSize) || metadata.metadataSize < 1) {
    throw new Error("Invalid comic metadata size");
  }
  if (metadata.metadataSha256.toLowerCase() !== sha256Hex(Buffer.from(metadataJson))) {
    throw new Error("Comic metadata digest does not match payload");
  }
  if (metadata.metadataSize !== Buffer.byteLength(metadataJson)) {
    throw new Error("Comic metadata size does not match payload");
  }
  assertFreshTimestamp(metadata.timestamp);

  return { comic, metadata };
}

export async function POST(request, options = {}) {
  const context = options.bucket ? null : getCloudflareContext();
  const bucket = options.bucket || context?.env?.COMICS_BUCKET;
  const env = options.env || context?.env || process.env;
  let body;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  let comic;
  let metadata;
  try {
    ({ comic, metadata } = publicationMetadata(body));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid comic metadata", 400);
  }

  const signatureBase64 = String(body?.signatureBase64 || "");
  if (!signatureBase64 || !publicKeyPems(env).some((publicKeyPem) => verifyComicPublishSignature({
    metadata,
    publicKeyPem,
    signatureBase64,
  }))) {
    return jsonError("Invalid publication signature", 401);
  }

  try {
    if (!bucket) throw new Error("COMICS_BUCKET binding is unavailable");

    const currentObject = await bucket.get(CATALOG_OBJECT_KEY);
    if (!currentObject?.body) return jsonError("Comic catalogue manifest is unavailable", 503);
    const current = await currentObject.json();

    for (const key of declaredComicAssetKeys(comic)) {
      if (!await bucket.head(key)) return jsonError(`Missing R2 asset: ${key}`, 409);
    }

    const nextCatalog = mergeComic(current, comic);
    await bucket.put(CATALOG_OBJECT_KEY, JSON.stringify(nextCatalog), {
      httpMetadata: {
        cacheControl: "private, no-store",
        contentType: "application/json",
      },
    });
    return Response.json({ ok: true, slug: comic.slug, catalogSize: nextCatalog.length });
  } catch (error) {
    console.error("comic publication failed", error);
    return jsonError("Comic publication failed", 502);
  }
}
