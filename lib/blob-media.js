import { Hono } from "hono";

const MEDIA_PREFIX = "/media/";
const COMICS_PREFIX = "comics/";
const ONE_YEAR = 31536000;
const BROWSER_CACHE_CONTROL = `public, max-age=${ONE_YEAR}, immutable`;
const CDN_CACHE_CONTROL = `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, immutable`;

const CONTENT_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".pdf", "application/pdf"],
]);

function extensionFor(blobPath) {
  const index = blobPath.lastIndexOf(".");
  return index === -1 ? "" : blobPath.slice(index).toLowerCase();
}

export function contentTypeForBlobPath(blobPath) {
  return CONTENT_TYPES.get(extensionFor(blobPath)) || "application/octet-stream";
}

export function assertSafeBlobPath(blobPath) {
  if (!blobPath.startsWith(COMICS_PREFIX)) {
    throw new Error("Unsupported media path");
  }

  const segments = blobPath.split("/");
  if (segments.length < 3 || segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("\\"))) {
    throw new Error("Unsafe media path");
  }

  if (!CONTENT_TYPES.has(extensionFor(blobPath))) {
    throw new Error("Unsupported media type");
  }

  return blobPath;
}

export function requestPathToBlobPath(url) {
  const rawQueryPath = url.searchParams.get("path");
  if (rawQueryPath) {
    const decodedQueryPath = decodeURIComponent(rawQueryPath).replace(/^\/+/, "");
    const queryBlobPath = decodedQueryPath.startsWith("media/")
      ? decodedQueryPath.slice("media/".length)
      : decodedQueryPath;
    return assertSafeBlobPath(queryBlobPath);
  }

  const decodedPath = decodeURIComponent(url.pathname);
  if (decodedPath.startsWith(COMICS_PREFIX)) {
    return assertSafeBlobPath(decodedPath);
  }

  if (!decodedPath.startsWith(`${MEDIA_PREFIX}${COMICS_PREFIX}`)) {
    throw new Error("Unsupported media path");
  }

  return assertSafeBlobPath(decodedPath.slice(MEDIA_PREFIX.length));
}

export function buildBlobMediaHeaders({ blobPath, contentLength, contentType, etag }) {
  const headers = {
    "Cache-Control": BROWSER_CACHE_CONTROL,
    "Cloudflare-CDN-Cache-Control": CDN_CACHE_CONTROL,
    "CDN-Cache-Control": CDN_CACHE_CONTROL,
    "Content-Type": contentType || contentTypeForBlobPath(blobPath),
  };

  if (contentLength !== undefined && contentLength !== null) {
    headers["Content-Length"] = String(contentLength);
  }

  if (etag) {
    headers.ETag = etag;
  }

  if (blobPath.toLowerCase().endsWith(".pdf")) {
    const filename = blobPath.split("/").at(-1);
    headers["Content-Disposition"] = `inline; filename="${filename}"`;
  }

  return headers;
}

function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}

function etagMatches(ifNoneMatch, etag) {
  if (!ifNoneMatch || !etag) return false;
  return ifNoneMatch.split(",").some((candidate) => {
    const normalized = candidate.trim();
    return normalized === "*" || normalized === etag;
  });
}

async function serveBlobMedia(request, bucket) {
  let blobPath;

  try {
    blobPath = requestPathToBlobPath(new URL(request.url));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid media path", 400);
  }

  try {
    if (!bucket) throw new Error("COMICS_BUCKET binding is unavailable");
    const isHeadRequest = request.method === "HEAD";
    const result = isHeadRequest
      ? await bucket.head(blobPath)
      : await bucket.get(blobPath);

    if (!result) {
      return jsonError("Media not found", 404);
    }

    if (etagMatches(request.headers.get("if-none-match"), result.httpEtag)) {
      return new Response(null, {
        status: 304,
        headers: buildBlobMediaHeaders({
          blobPath,
          etag: result.httpEtag,
        }),
      });
    }

    return new Response(isHeadRequest ? null : result.body, {
      headers: buildBlobMediaHeaders({
        blobPath,
        contentLength: result.size,
        contentType: result.httpMetadata?.contentType,
        etag: result.httpEtag,
      }),
    });
  } catch (error) {
    console.error("blob media endpoint failed", error);
    return jsonError("Media is unavailable", 502);
  }
}

export function createApp(options = {}) {
  const app = new Hono();
  const bucket = options.bucket;

  app.get("/media/*", (c) => serveBlobMedia(c.req.raw, bucket));
  app.on("HEAD", "/media/*", (c) => serveBlobMedia(c.req.raw, bucket));

  return app;
}

let cachedApp;

export function getApp() {
  if (!cachedApp) cachedApp = createApp();
  return cachedApp;
}

export function GET(request) {
  return getApp().fetch(request);
}

export function HEAD(request) {
  return getApp().fetch(request);
}
