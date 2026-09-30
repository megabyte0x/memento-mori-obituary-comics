import { getCloudflareContext } from "@opennextjs/cloudflare";

import { serveBlobMedia } from "@/lib/blob-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function serveMedia(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return await serveBlobMedia(request, env.COMICS_BUCKET);
  } catch (error) {
    console.error("media route failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Media is unavailable" },
      { status: 500 },
    );
  }
}

export function GET(request) {
  return serveMedia(request);
}

export function HEAD(request) {
  return serveMedia(request);
}
