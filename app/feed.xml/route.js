import {
  citationPassage,
  comicDescription,
  comicUrl,
  firstImageUrl,
} from "../../lib/comics.js";
import { loadRuntimeComics } from "../../lib/runtime-comics.js";
import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
} from "../../lib/site.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function publicationDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.valueOf()) ? "" : date.toUTCString();
}

export async function GET() {
  const comics = await loadRuntimeComics();
  const items = comics.slice(0, 20).map((comic) => {
    const url = comicUrl(comic);
    const imageUrl = firstImageUrl(comic);
    return `<item>
  <title>${escapeXml(`${comic.person} - ${comic.title}`)}</title>
  <link>${escapeXml(url)}</link>
  <guid isPermaLink="true">${escapeXml(url)}</guid>
  <pubDate>${escapeXml(publicationDate(comic.published_at))}</pubDate>
  <description>${escapeXml(citationPassage(comic) || comicDescription(comic))}</description>${imageUrl ? `
  <media:content url="${escapeXml(imageUrl)}" medium="image" />` : ""}
</item>`;
  }).join("\n");
  const latestDate = publicationDate(comics[0]?.published_at || "");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>${escapeXml(SITE_NAME)}</title>
  <link>${escapeXml(absoluteUrl("/"))}</link>
  <description>${escapeXml(SITE_DESCRIPTION)}</description>
  <language>${escapeXml(SITE_LANGUAGE)}</language>
  <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />${latestDate ? `
  <lastBuildDate>${escapeXml(latestDate)}</lastBuildDate>` : ""}
${items}
</channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
