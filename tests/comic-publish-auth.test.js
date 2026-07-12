import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";

import { POST } from "../app/api/admin/comic-publish/route.js";
import { canonicalJson } from "../lib/comic-catalog.js";
import { sha256Hex, signComicPublish } from "../lib/blob-upload-auth.js";

function testKeys() {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return {
    privateKeyPem: privateKey.export({ format: "pem", type: "pkcs8" }),
    publicKeyPem: publicKey.export({ format: "pem", type: "spki" }),
  };
}

function validComic(overrides = {}) {
  return {
    slug: "ada-lovelace",
    person: "Ada Lovelace",
    title: "Algorithmic Imagination",
    published_at: "2026-07-12",
    pages: ["pages/01.jpg"],
    pdf: "ada-lovelace.pdf",
    contact_sheet: "contact-sheet.jpg",
    ...overrides,
  };
}

function signedPublishRequest(comic, privateKeyPem) {
  const metadataJson = canonicalJson(comic);
  const metadata = {
    slug: comic.slug,
    metadataSha256: sha256Hex(Buffer.from(metadataJson)),
    metadataSize: Buffer.byteLength(metadataJson),
    timestamp: Date.now(),
  };
  return new Request("https://www.finalnotes.page/api/admin/comic-publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      comic,
      ...metadata,
      signatureBase64: signComicPublish({ metadata, privateKeyPem }),
    }),
  });
}

test("POST /api/admin/comic-publish writes the manifest only after every asset exists", async () => {
  const { privateKeyPem, publicKeyPem } = testKeys();
  const comic = validComic();
  const puts = [];
  const heads = [];
  const response = await POST(signedPublishRequest(comic, privateKeyPem), {
    env: { FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY: publicKeyPem },
    bucket: {
      get: async () => ({ body: new Blob(["[]"]).stream(), json: async () => [] }),
      head: async (key) => {
        heads.push(key);
        return { size: 10 };
      },
      put: async (...args) => puts.push(args),
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(heads, [
    "comics/ada-lovelace/pages/01.jpg",
    "comics/ada-lovelace/ada-lovelace.pdf",
    "comics/ada-lovelace/contact-sheet.jpg",
  ]);
  assert.equal(puts.length, 1);
  assert.equal(puts[0][0], "catalog/comics.json");
  assert.deepEqual(JSON.parse(puts[0][1]).map((item) => item.slug), [comic.slug]);
});

test("POST /api/admin/comic-publish leaves the manifest untouched when an asset is missing", async () => {
  const { privateKeyPem, publicKeyPem } = testKeys();
  const response = await POST(signedPublishRequest(validComic(), privateKeyPem), {
    env: { FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY: publicKeyPem },
    bucket: {
      get: async () => ({ body: new Blob(["[]"]).stream(), json: async () => [] }),
      head: async () => null,
      put: async () => assert.fail("must not write a partial catalogue"),
    },
  });

  assert.equal(response.status, 409);
});

test("POST /api/admin/comic-publish rejects an invalid signature before R2 access", async () => {
  const { privateKeyPem } = testKeys();
  const { publicKeyPem: differentPublicKeyPem } = testKeys();
  let read = false;
  const response = await POST(signedPublishRequest(validComic(), privateKeyPem), {
    env: { FINALNOTES_BLOB_UPLOAD_PUBLIC_KEY: differentPublicKeyPem },
    bucket: {
      get: async () => {
        read = true;
        return null;
      },
    },
  });

  assert.equal(response.status, 401);
  assert.equal(read, false);
});
