#!/usr/bin/env node
// List published comics that still need the reader SEO fields backfilled.
// The publishing agent works through this list, regenerating each comic's
// metadata and republishing it with `pnpm comic:publish -- --slug <slug>
// --metadata-file <file> --metadata-only`.
//
//   node scripts/audit_comic_seo.mjs            # table
//   node scripts/audit_comic_seo.mjs --json     # machine-readable

import { fileURLToPath } from "node:url";

const SITE = (process.env.FINALNOTES_SITE_URL || "https://www.finalnotes.page").replace(/\/+$/, "");
const AUTHORED_FAQ_MINIMUM = 3;

function count(html, pattern) {
  return (html.match(pattern) || []).length;
}

export function auditReaderHtml(html) {
  const pages = count(html, /class="reader-page"/g);
  const transcripts = count(html, /class="reader-page-transcript"/g);
  const faq = count(html, /class="reader-faq-item"/g);
  const summaries = count(html, /class="reader-page-summary"/g);
  const missing = [];
  if (transcripts < pages) missing.push("page_transcripts");
  if (faq < AUTHORED_FAQ_MINIMUM) missing.push("faq");
  if (summaries < pages) missing.push("page_summaries");
  return { pages, transcripts, faq, summaries, missing };
}

async function main() {
  const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+\/comics\/[^<]+)<\/loc>/g)].map((match) => match[1]);
  const rows = [];
  for (let index = 0; index < urls.length; index += 8) {
    const batch = await Promise.all(urls.slice(index, index + 8).map(async (url) => {
      const html = await (await fetch(url)).text();
      return { slug: url.split("/comics/")[1].replace(/\/$/, ""), ...auditReaderHtml(html) };
    }));
    rows.push(...batch);
  }
  const incomplete = rows.filter((row) => row.missing.length);
  if (process.argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify({ checked: rows.length, incomplete }, null, 2)}\n`);
    return;
  }
  for (const row of incomplete) console.log(`${row.slug.padEnd(48)} missing: ${row.missing.join(", ")}`);
  console.log(`\n${incomplete.length} of ${rows.length} comics need backfill.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
