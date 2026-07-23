import {
  assertSafeBlobPath,
  contentTypeForBlobPath,
} from "./blob-media.js";

const OPTIMIZED_IMAGE_PREFIX = "optimized-image";
const ALLOWED_WIDTHS = new Set([128, 256, 384, 640, 768, 1080, 1440, 1920]);
const ALLOWED_QUALITIES = new Set([75]);
const ONE_YEAR = 31536000;
const BROWSER_CACHE_CONTROL = `public, max-age=${ONE_YEAR}, immutable`;
const CDN_CACHE_CONTROL = `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, immutable`;

function errorResponse(message, status) {
  return Response.json({ error: message }, { status });
}

export function parseOptimizedImageUrl(url) {
  const segments = decodeURIComponent(url.pathname).split("/").filter(Boolean);
  const [prefix, widthValue, qualityValue, ...blobSegments] = segments;
  const width = Number(widthValue);
  const quality = Number(qualityValue);

  if (prefix !== OPTIMIZED_IMAGE_PREFIX || !ALLOWED_WIDTHS.has(width)) {
    throw new Error("Unsupported image width");
  }
  if (!ALLOWED_QUALITIES.has(quality)) {
    throw new Error("Unsupported image quality");
  }

  const blobPath = assertSafeBlobPath(blobSegments.join("/"));
  if (!contentTypeForBlobPath(blobPath).startsWith("image/")) {
    throw new Error("Unsupported image type");
  }

  return { blobPath, quality, width };
}

function transformedEtag(sourceEtag, width, quality) {
  const normalizedSource = String(sourceEtag || "source")
    .replace(/^W\//, "")
    .replaceAll('"', "");
  return `W/"${normalizedSource}-${width}-${quality}-webp"`;
}

function requestEtagMatches(request, etag) {
  const candidates = request.headers.get("if-none-match");
  if (!candidates || !etag) return false;
  return candidates.split(",").some((candidate) => {
    const normalized = candidate.trim();
    return normalized === "*" || normalized === etag;
  });
}

function cacheHeaders(headers, mode) {
  headers.set("Cache-Control", BROWSER_CACHE_CONTROL);
  headers.set("CDN-Cache-Control", CDN_CACHE_CONTROL);
  headers.set("Cloudflare-CDN-Cache-Control", CDN_CACHE_CONTROL);
  headers.set("X-Finalnotes-Image-Transform", mode);
  return headers;
}

function originalResponse(result, body) {
  const headers = cacheHeaders(new Headers({
    "Content-Type": result.httpMetadata?.contentType || "application/octet-stream",
  }), "original-fallback");
  if (result.httpEtag) headers.set("ETag", result.httpEtag);
  if (result.size !== undefined) headers.set("Content-Length", String(result.size));
  return new Response(body, { headers });
}

async function transformedResponse(result, images, width, quality) {
  const [imageInput, fallbackBody] = result.body.tee();

  try {
    const output = await images
      .input(imageInput)
      .transform({ fit: "scale-down", width })
      .output({ format: "image/webp", quality });
    const response = output.response();
    if (!response.ok) {
      throw new Error(`Images binding returned ${response.status}`);
    }

    const headers = cacheHeaders(new Headers(response.headers), "images-binding");
    headers.set("Content-Type", "image/webp");
    headers.set("ETag", transformedEtag(result.httpEtag, width, quality));
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Images binding transformation failed; serving original media", error);
    return originalResponse(result, fallbackBody);
  }
}

export async function serveOptimizedImage(request, options = {}) {
  let parsed;
  try {
    parsed = parseOptimizedImageUrl(new URL(request.url));
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Invalid image request", 400);
  }

  const { blobPath, quality, width } = parsed;
  const { bucket, images } = options;
  if (!bucket) return errorResponse("COMICS_BUCKET binding is unavailable", 502);

  try {
    if (request.method === "HEAD") {
      const result = await bucket.head(blobPath);
      if (!result) return errorResponse("Image not found", 404);
      const etag = images
        ? transformedEtag(result.httpEtag, width, quality)
        : result.httpEtag;
      const headers = cacheHeaders(new Headers({
        "Content-Type": images
          ? "image/webp"
          : result.httpMetadata?.contentType || contentTypeForBlobPath(blobPath),
      }), images ? "images-binding" : "original-fallback");
      if (etag) headers.set("ETag", etag);
      return new Response(null, {
        status: requestEtagMatches(request, etag) ? 304 : 200,
        headers,
      });
    }

    const result = await bucket.get(blobPath);
    if (!result) return errorResponse("Image not found", 404);
    const etag = images
      ? transformedEtag(result.httpEtag, width, quality)
      : result.httpEtag;
    if (requestEtagMatches(request, etag)) {
      const headers = cacheHeaders(new Headers(), images ? "images-binding" : "original-fallback");
      headers.set("ETag", etag);
      return new Response(null, { status: 304, headers });
    }

    if (!images || !result.body) {
      return originalResponse(result, result.body || null);
    }
    return transformedResponse(result, images, width, quality);
  } catch (error) {
    console.error("optimized image endpoint failed", error);
    return errorResponse("Image is unavailable", 502);
  }
}
