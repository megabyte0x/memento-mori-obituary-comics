import { comicAssetBlobPath } from "./media-paths.js";
import { imageSize } from "./comic-presenters.js";

export const SHARE_CARD_WIDTH = 1200;
export const SHARE_CARD_HEIGHT = 630;
const CACHE_CONTROL = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
const SHARE_CARD_FILE = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.jpg$/;

export function parseShareCardFile(file = "") {
  const match = String(file).match(SHARE_CARD_FILE);
  return match ? match[1] : "";
}

export function coverBlobPath(comic) {
  const first = comic?.pages?.[0];
  return first ? comicAssetBlobPath(comic, first) : "";
}

// Width of the cover once scaled to the card height, so it can be centred.
export function foregroundWidth(comic) {
  const { width, height } = imageSize(comic, comic?.pages?.[0] || "");
  if (!width || !height) return Math.round(SHARE_CARD_HEIGHT * (9 / 16));
  return Math.min(SHARE_CARD_WIDTH, Math.round((width * SHARE_CARD_HEIGHT) / height));
}

function headers(contentType, mode) {
  return new Headers({
    "Content-Type": contentType,
    "Cache-Control": CACHE_CONTROL,
    "X-Finalnotes-Share-Card": mode,
  });
}

// Composes a 1200x630 card: the portrait cover centred on a blurred, darkened
// copy of itself. Falls back to the original cover if the Images binding fails.
export async function serveShareCard({ comic, bucket, images, method = "GET" }) {
  if (!comic) return Response.json({ error: "Comic not found" }, { status: 404 });
  if (!bucket) return Response.json({ error: "COMICS_BUCKET binding is unavailable" }, { status: 502 });

  const key = coverBlobPath(comic);
  const object = key ? await bucket.get(key) : null;
  if (!object) return Response.json({ error: "Cover not found" }, { status: 404 });
  const originalType = object.httpMetadata?.contentType || "image/jpeg";

  if (!images) {
    return new Response(method === "HEAD" ? null : object.body, { headers: headers(originalType, "original-fallback") });
  }

  const [backdropStream, rest] = object.body.tee();
  const [foregroundStream, fallbackStream] = rest.tee();
  try {
    const width = foregroundWidth(comic);
    // Resize the foreground first and draw its bytes: passing a transformer to
    // draw() is not supported by the local dev proxy.
    const foreground = (await images
      .input(foregroundStream)
      .transform({ width, height: SHARE_CARD_HEIGHT, fit: "scale-down" })
      .output({ format: "image/png" })).response();
    if (!foreground.ok) throw new Error(`Images binding returned ${foreground.status} for the foreground`);
    const output = await images
      .input(backdropStream)
      .transform({ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT, fit: "cover", blur: 50, brightness: 0.45 })
      .draw(foreground.body, { top: 0, left: Math.round((SHARE_CARD_WIDTH - width) / 2) })
      .output({ format: "image/jpeg", quality: 85 });
    const response = output.response();
    if (!response.ok) throw new Error(`Images binding returned ${response.status}`);
    return new Response(method === "HEAD" ? null : response.body, { headers: headers("image/jpeg", "images-binding") });
  } catch (error) {
    console.error("Share card composition failed; serving the cover", error);
    return new Response(method === "HEAD" ? null : fallbackStream, { headers: headers(originalType, "original-fallback") });
  }
}
