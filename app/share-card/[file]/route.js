import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getComic } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { parseShareCardFile, serveShareCard } from "@/lib/share-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request, { params }) {
  const { file } = await params;
  const slug = parseShareCardFile(file);
  if (!slug) return Response.json({ error: "Unsupported share card" }, { status: 400 });
  try {
    const { env } = await getCloudflareContext({ async: true });
    const comic = getComic(await loadRuntimeComics({ bucket: env.COMICS_BUCKET }), slug);
    return await serveShareCard({ comic, bucket: env.COMICS_BUCKET, images: env.IMAGES, method: request.method });
  } catch (error) {
    console.error("share card route failed", error);
    return Response.json({ error: "Share card is unavailable" }, { status: 500 });
  }
}

export const GET = handle;
export const HEAD = handle;
