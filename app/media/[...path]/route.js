import { getCloudflareContext } from "@opennextjs/cloudflare";

import { createApp } from "@/lib/blob-media";

export const runtime = "nodejs";

export function GET(request) {
  const { env } = getCloudflareContext();
  return createApp({ bucket: env.COMICS_BUCKET }).fetch(request);
}

export function HEAD(request) {
  const { env } = getCloudflareContext();
  return createApp({ bucket: env.COMICS_BUCKET }).fetch(request);
}
