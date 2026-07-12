import { getCloudflareContext } from "@opennextjs/cloudflare";

import { createApp } from "@/lib/latest-pdf";
import { loadRuntimeComics } from "@/lib/runtime-comics";

export function GET(request) {
  const { env } = getCloudflareContext();
  return createApp(env, {
    bucket: env.COMICS_BUCKET,
    loadComics: () => loadRuntimeComics({ bucket: env.COMICS_BUCKET }),
  }).fetch(request);
}
