// Submit every public URL to IndexNow so Bing and Yandex index/refresh the site
// immediately (no login required). Google does not use IndexNow — for Google,
// verify the property in Search Console and submit the sitemap there.
//
// Bing's index also backs ChatGPT web search, so IndexNow is a GEO win too.
//
// Usage:
//   node scripts/submit_indexnow.mjs                # submit live sitemap URLs
//   node scripts/submit_indexnow.mjs --dry-run      # print URLs, do not submit
//
// The IndexNow key must already be live at https://<host>/<key>.txt. The key
// file lives in public/ and ships with the normal deploy.

import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = (process.env.FINALNOTES_SITE_URL || "https://www.finalnotes.page").replace(/\/+$/, "");
const hostname = new URL(HOST).hostname;
const dryRun = process.argv.includes("--dry-run");

// Discover the IndexNow key from the public key file (public/<key>.txt).
const keyFile = fs.readdirSync(path.join(ROOT, "public")).find((f) => /^[a-f0-9]{8,}\.txt$/i.test(f));
if (!keyFile) {
  console.error("No IndexNow key file found in public/ (expected <key>.txt).");
  process.exit(1);
}
const key = keyFile.replace(/\.txt$/i, "");
const keyLocation = `${HOST}/${keyFile}`;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "finalnotes-indexnow/1.0" } }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    }).on("error", reject);
  });
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname, method: "POST", headers: { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(data) } },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Pull the canonical URL list straight from the live sitemap so it never drifts.
const sitemap = await get(`${HOST}/sitemap.xml`);
if (sitemap.status !== 200) {
  console.error(`Could not fetch ${HOST}/sitemap.xml (HTTP ${sitemap.status}).`);
  process.exit(1);
}
const urlList = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
console.log(`Found ${urlList.length} URLs in sitemap. Key: ${key}`);

if (dryRun) {
  urlList.forEach((u) => console.log("  " + u));
  console.log("\nDry run — nothing submitted.");
  process.exit(0);
}

// Verify the key file is actually live before submitting (IndexNow checks it).
const keyCheck = await get(keyLocation);
if (keyCheck.status !== 200 || keyCheck.body.trim() !== key) {
  console.error(`Key file not live/valid at ${keyLocation} (HTTP ${keyCheck.status}). Deploy first, then retry.`);
  process.exit(1);
}

const res = await postJson("https://api.indexnow.org/indexnow", { host: hostname, key, keyLocation, urlList });
console.log(`IndexNow response: HTTP ${res.status} ${res.body || "(empty body = accepted)"}`);
// 200 and 202 both mean accepted.
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
