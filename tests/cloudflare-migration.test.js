import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const read = (file) => readFileSync(path.join(ROOT, file), "utf8");

test("package scripts build, preview, and deploy the OpenNext Worker", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.equal(pkg.scripts.build, "next build --webpack");
  assert.equal(pkg.scripts.preview, "opennextjs-cloudflare build && opennextjs-cloudflare preview");
  assert.equal(pkg.scripts.deploy, "opennextjs-cloudflare build && opennextjs-cloudflare deploy");
  assert.equal(pkg.scripts["cf-typegen"], "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts");
  assert.ok(pkg.devDependencies["@opennextjs/cloudflare"]);
  assert.ok(pkg.devDependencies.wrangler);
});

test("runtime dependencies and layout contain no Vercel integrations", () => {
  const pkg = JSON.parse(read("package.json"));
  const dependencyNames = Object.keys(pkg.dependencies || {});

  assert.deepEqual(dependencyNames.filter((name) => name.startsWith("@vercel/")), []);
  assert.doesNotMatch(read("app/layout.jsx"), /@vercel\//);
  assert.doesNotMatch(read("lib/blob-media.js"), /@vercel\//);
  assert.doesNotMatch(read("lib/latest-pdf.js"), /@vercel\//);
});

test("Worker runtime bundles comics data instead of reading host filesystem paths", () => {
  assert.doesNotMatch(read("lib/comics.js"), /createRequire|require\("\.\.\/comics\.json"\)/);
  assert.doesNotMatch(read("lib/latest-pdf.js"), /node:fs|readFile\(|process\.cwd\(\)/);
});

test("Cloudflare Worker, OpenNext, and cache configuration are committed", () => {
  for (const file of ["wrangler.jsonc", "open-next.config.ts", "public/_headers"]) {
    assert.equal(existsSync(path.join(ROOT, file)), true, `${file} must exist`);
  }

  const wrangler = read("wrangler.jsonc");
  assert.match(wrangler, /"main"\s*:\s*"\.open-next\/worker\.js"/);
  assert.match(wrangler, /"binding"\s*:\s*"COMICS_BUCKET"/);
  assert.match(wrangler, /"nodejs_compat"/);
  assert.match(read("public/_headers"), /\/_next\/static\/\*/);
  assert.match(read("open-next.config.ts"), /static-assets-incremental-cache/);
  assert.match(read("open-next.config.ts"), /enableCacheInterception:\s*true/);
  assert.match(read("next.config.mjs"), /loaderFile:\s*"\.\/image-loader\.js"/);
  assert.match(read("next.config.mjs"), /unoptimized:\s*process\.env\.CLOUDFLARE_IMAGE_TRANSFORMATIONS\s*!==\s*"1"/);
});

test("Vercel deployment files are removed", () => {
  assert.equal(existsSync(path.join(ROOT, "vercel.json")), false);
  assert.equal(existsSync(path.join(ROOT, ".vercelignore")), false);
});
