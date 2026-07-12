import { getCloudflareContext } from "@opennextjs/cloudflare";

import { createApp } from "@/lib/latest-pdf";

export function GET(request) {
  const { env } = getCloudflareContext();
  return createApp(env, { bucket: env.COMICS_BUCKET }).fetch(request);
}
