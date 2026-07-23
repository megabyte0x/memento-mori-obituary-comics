import { getCloudflareContext } from "@opennextjs/cloudflare";

import { serveOptimizedImage } from "@/lib/optimized-image";

export const runtime = "nodejs";

export function GET(request) {
  const { env } = getCloudflareContext();
  return serveOptimizedImage(request, {
    bucket: env.COMICS_BUCKET,
    images: env.IMAGES,
  });
}

export function HEAD(request) {
  const { env } = getCloudflareContext();
  return serveOptimizedImage(request, {
    bucket: env.COMICS_BUCKET,
    images: env.IMAGES,
  });
}
