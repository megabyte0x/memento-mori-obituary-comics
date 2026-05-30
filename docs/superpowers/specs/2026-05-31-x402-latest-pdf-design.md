# x402 Latest PDF Endpoint Design

## Goal

Add a machine-payable endpoint that lets an agent request the latest obituary comic PDF after paying exactly 0.1 USDC on Base mainnet through x402.

## Current Context

The project is intentionally static: generated HTML, images, PDFs, and `comics.json` live in the repository with no database, auth system, or build step. Vercel can host static assets and deploy files under `api/` as Functions, so the paid endpoint can be added without converting the site to Next.js.

`comics.json` is the source of truth for published comics. The homepage already treats the first comic as the latest when multiple comics have the same `published_at` value, so the endpoint should sort by newest `published_at` and use archive order as the tie-breaker.

## Architecture

Create `GET /api/latest-pdf` as a Vercel Function backed by a small Hono app and the official x402 server middleware. The route is protected by x402 before the PDF handler runs. After payment verification and settlement, the handler reads the latest PDF from the checked-in `comics/<slug>/` directory and returns PDF bytes.

The x402 payment configuration uses:

- Scheme: `exact`
- Network: `eip155:8453` for Base mainnet
- Price: `"$0.10"` for 0.1 USDC
- Receiver: `X402_PAY_TO`
- Facilitator: CDP mainnet facilitator from `@coinbase/x402`

## Environment

Production deployments must provide:

- `X402_PAY_TO`: EVM address receiving USDC payments
- `CDP_API_KEY_ID`: CDP facilitator API key id
- `CDP_API_KEY_SECRET`: CDP facilitator API key secret

The endpoint should return a JSON `500` configuration error if `X402_PAY_TO` is missing or malformed. CDP credential validation is left to the facilitator client because the official `@coinbase/x402` facilitator integration reads those values.

## Response Behavior

Unauthenticated or unpaid agent requests receive the x402 `402 Payment Required` response emitted by the middleware. Paid requests receive:

- `200 OK`
- `Content-Type: application/pdf`
- `Content-Disposition: inline; filename="<pdf-name>"`
- `Cache-Control: private, no-store`
- Body: latest PDF bytes

Missing `comics.json`, missing PDF metadata, or missing PDF files return explicit JSON `500` errors and log server-side diagnostics.

## Testing

Add Node unit tests for the pure latest-PDF helpers:

- latest selection uses newest `published_at`
- archive order wins ties
- PDFs without `pdf` metadata are skipped
- path resolution rejects traversal-style PDF names

Keep the existing Python rendering tests unchanged and run them as a regression check.

## Sources

- ETHSKILLS: `https://ethskills.com/`
- x402 sellers quickstart: `https://docs.cdp.coinbase.com/x402/quickstart-for-sellers`
- x402 network support: `https://docs.cdp.coinbase.com/x402/network-support`
- Vercel Functions API: `https://vercel.com/docs/functions/functions-api-reference`
