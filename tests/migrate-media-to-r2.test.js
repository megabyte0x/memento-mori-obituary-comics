import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";

import { collectComicMediaKeys, migrateMediaObject } from "../scripts/migrate_media_to_r2.js";

test("collectComicMediaKeys returns unique stable R2 keys", () => {
  const keys = collectComicMediaKeys([
    {
      slug: "sample",
      pages: ["pages/01.jpg", "pages/01.jpg"],
      pdf: "sample.pdf",
      contact_sheet: "contact-sheet.jpg",
    },
  ]);

  assert.deepEqual(keys, [
    "comics/sample/contact-sheet.jpg",
    "comics/sample/pages/01.jpg",
    "comics/sample/sample.pdf",
  ]);
});

test("migrateMediaObject signs source bytes and verifies the target", async () => {
  const { privateKey } = generateKeyPairSync("ed25519");
  const privateKeyPem = privateKey.export({ format: "pem", type: "pkcs8" });
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, options });
    if (url.startsWith("https://source.example")) {
      return new Response("image-bytes", { headers: { "content-type": "image/jpeg" } });
    }
    if (options.method === "POST") return Response.json({ ok: true });
    return new Response(null, { headers: { "content-length": "11" } });
  };

  const result = await migrateMediaObject({
    fetchImpl,
    key: "comics/sample/pages/01.jpg",
    privateKeyPem,
    sourceBase: "https://source.example",
    targetBase: "https://target.example",
  });

  assert.equal(result.bytes, 11);
  assert.equal(result.key, "comics/sample/pages/01.jpg");
  assert.equal(requests[1].url, "https://target.example/api/admin/blob-upload");
  const payload = JSON.parse(requests[1].options.body);
  assert.equal(payload.blobPath, result.key);
  assert.equal(payload.contentType, "image/jpeg");
  assert.ok(payload.signatureBase64);
  assert.equal(requests[2].options.method, "HEAD");
});
