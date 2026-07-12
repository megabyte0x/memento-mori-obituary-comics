import path from "node:path";

import comicsData from "../comics.json" with { type: "json" };
import { facilitator } from "@coinbase/x402";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { Hono } from "hono";

const X402_NETWORK = "eip155:8453";
const X402_PRICE = "$0.10";
const ENDPOINT_PATHS = ["/api/latest-pdf", "/api/latest-pdf/"];

let cachedApp;

export function findLatestComicWithPdf(comics) {
  if (!Array.isArray(comics)) throw new TypeError("Expected comics to be an array");

  let latest = null;
  let latestTime = Number.NEGATIVE_INFINITY;
  for (const comic of comics) {
    if (!comic || typeof comic !== "object" || !comic.pdf) continue;
    const publishedTime = Date.parse(comic.published_at || "");
    const sortableTime = Number.isNaN(publishedTime) ? Number.NEGATIVE_INFINITY : publishedTime;
    if (!latest || sortableTime > latestTime) {
      latest = comic;
      latestTime = sortableTime;
    }
  }
  if (!latest) throw new Error("No published comic PDF found");
  return latest;
}

export function resolveComicPdfBlobPath(comic) {
  if (!comic?.slug || !comic?.pdf) throw new Error("Comic PDF metadata is incomplete");
  if (path.basename(comic.pdf) !== comic.pdf) throw new Error("Unsafe PDF filename");
  return `comics/${comic.slug}/${comic.pdf}`;
}

export async function readLatestPdfFromBucket(comics, bucket) {
  if (!bucket) throw new Error("COMICS_BUCKET binding is unavailable");
  const comic = findLatestComicWithPdf(comics);
  const key = resolveComicPdfBlobPath(comic);
  const object = await bucket.get(key);

  if (!object?.body) {
    throw new Error(`Latest PDF R2 object not found: ${key}`);
  }

  return { comic, object };
}

export function buildPdfHeaders(comic, contentLength) {
  const filename = path.basename(comic.pdf);
  return {
    "Cache-Control": "private, no-store",
    "Content-Disposition": `inline; filename="${filename}"`,
    "Content-Length": String(contentLength),
    "Content-Type": "application/pdf",
    "X-Comic-Slug": comic.slug,
  };
}

export function jsonError(message, status = 500) {
  return Response.json({ error: message }, { status });
}

function isEvmAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value || "");
}

export function createApp(env = process.env, options = {}) {
  const app = new Hono();
  app.onError((error, c) => {
    console.error("x402 payment middleware failed", error);
    return c.json({ error: "Payment facilitator is unavailable" }, 502);
  });
  const payTo = env.X402_PAY_TO;
  const bucket = options.bucket;
  const facilitatorClient = options.facilitatorClient || new HTTPFacilitatorClient(facilitator);
  const syncFacilitatorOnStart = options.syncFacilitatorOnStart ?? true;
  const comics = options.comics || comicsData;

  if (!isEvmAddress(payTo)) {
    for (const endpointPath of ENDPOINT_PATHS) {
      app.get(endpointPath, () => jsonError("X402_PAY_TO must be a valid EVM address"));
    }
    return app;
  }

  const routes = Object.fromEntries(
    ENDPOINT_PATHS.map((endpointPath) => [
      `GET ${endpointPath}`,
      {
        accepts: [
          {
            scheme: "exact",
            price: X402_PRICE,
            network: X402_NETWORK,
            payTo,
          },
        ],
        description: "Latest Memento Mori Obituary Comic PDF",
        mimeType: "application/pdf",
      },
    ]),
  );

  const resourceServer = new x402ResourceServer(facilitatorClient).register(X402_NETWORK, new ExactEvmScheme());
  app.use(paymentMiddleware(routes, resourceServer, undefined, undefined, syncFacilitatorOnStart));

  for (const endpointPath of ENDPOINT_PATHS) {
    app.get(endpointPath, async () => {
      try {
        const { comic, object } = await readLatestPdfFromBucket(comics, bucket);
        return new Response(object.body, { headers: buildPdfHeaders(comic, object.size) });
      } catch (error) {
        console.error("latest-pdf endpoint failed", error);
        return jsonError("Latest PDF is unavailable");
      }
    });
  }

  return app;
}

export function getApp() {
  if (!cachedApp) cachedApp = createApp();
  return cachedApp;
}
