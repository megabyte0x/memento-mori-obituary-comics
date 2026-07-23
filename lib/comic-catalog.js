export const CATALOG_OBJECT_KEY = "catalog/comics.json";

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_ASSET_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function canonicalJson(value) {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  if (!value || typeof value !== "object") throw new TypeError("Catalogue metadata must be JSON serializable");

  return `{${Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function requiredText(value, field, slug = "comic") {
  const text = String(value || "").trim();
  if (!text) throw new Error(`${slug} is missing ${field}`);
  return text;
}

function safeAssetPath(value, slug, field) {
  const assetPath = requiredText(value, field, slug);
  const segments = assetPath.split("/");
  if (
    assetPath.startsWith("/")
    || assetPath.includes("\\")
    || segments.some((segment) => !SAFE_ASSET_SEGMENT.test(segment))
  ) {
    throw new Error(`${slug} has an unsafe ${field}`);
  }
  return assetPath;
}

function publishedDate(value, slug) {
  const date = requiredText(value, "published_at", slug);
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!ISO_DATE.test(date) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${slug} has an invalid published_at date`);
  }
  return date;
}

function isAbsoluteHttpsUrl(value) {
  try {
    return new URL(String(value || "")).protocol === "https:";
  } catch {
    return false;
  }
}

export function validateComic(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Comic must be an object");
  }

  const comic = structuredClone(value);
  const slug = requiredText(comic.slug, "slug");
  if (!SAFE_SLUG.test(slug)) throw new Error(`Comic has an invalid slug: ${slug}`);
  comic.slug = slug;
  comic.person = requiredText(comic.person, "person", slug);
  comic.title = requiredText(comic.title, "title", slug);
  comic.published_at = publishedDate(comic.published_at, slug);

  if (!Array.isArray(comic.pages) || comic.pages.length === 0) {
    throw new Error(`${slug} is missing pages`);
  }
  comic.pages = comic.pages.map((page) => safeAssetPath(page, slug, "page"));

  for (const field of ["pdf", "contact_sheet"]) {
    if (comic[field]) comic[field] = safeAssetPath(comic[field], slug, field);
  }

  return comic;
}

export function validatePublishableComic(value) {
  const comic = validateComic(value);
  const errors = [];
  const citationPassage = String(comic.citation_passage || "").replace(/\s+/g, " ").trim();
  const passageWordCount = citationPassage.split(/\s+/).filter(Boolean).length;

  if (passageWordCount < 134 || passageWordCount > 167) {
    errors.push(`citation_passage must contain 134 to 167 words; found ${passageWordCount}`);
  }

  if (
    !Array.isArray(comic.page_summaries)
    || comic.page_summaries.length !== comic.pages.length
    || comic.page_summaries.some((summary) => !String(summary || "").trim())
  ) {
    errors.push(`page_summaries must contain one page summary per page; expected ${comic.pages.length}`);
  }

  if (!Array.isArray(comic.sameAs) || comic.sameAs.length === 0 || comic.sameAs.some((url) => !isAbsoluteHttpsUrl(url))) {
    errors.push("sameAs must contain absolute HTTPS URLs");
  }

  if (
    !Array.isArray(comic.sources)
    || comic.sources.length === 0
    || comic.sources.some((source) => (
      !source
      || typeof source !== "object"
      || Array.isArray(source)
      || !String(source.name || "").trim()
      || !isAbsoluteHttpsUrl(source.url)
    ))
  ) {
    errors.push("sources must contain named absolute HTTPS URLs");
  }

  if (errors.length) {
    throw new Error(`${comic.slug} has invalid SEO/GEO metadata: ${errors.join("; ")}`);
  }

  comic.citation_passage = citationPassage;
  comic.page_summaries = comic.page_summaries.map((summary) => String(summary).replace(/\s+/g, " ").trim());
  comic.sameAs = comic.sameAs.map((url) => String(url).trim());
  comic.sources = comic.sources.map((source) => ({
    ...source,
    name: String(source.name).trim(),
    url: String(source.url).trim(),
  }));
  return comic;
}

export function normalizeCatalog(items) {
  if (!Array.isArray(items)) throw new TypeError("Comic catalogue must be an array");

  const slugs = new Set();
  const comics = items.map((item) => {
    const comic = validateComic(item);
    if (slugs.has(comic.slug)) throw new Error(`Duplicate comic slug: ${comic.slug}`);
    slugs.add(comic.slug);
    return comic;
  });

  return comics.sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)));
}

export function mergeComic(items, comic) {
  const nextComic = validatePublishableComic(comic);
  const current = Array.isArray(items) ? items : [];
  return normalizeCatalog([nextComic, ...current.filter((item) => item?.slug !== nextComic.slug)]);
}

export function declaredComicAssetKeys(comic) {
  const validated = validateComic(comic);
  const references = [
    ...validated.pages,
    ...(validated.pdf ? [validated.pdf] : []),
    ...(validated.contact_sheet ? [validated.contact_sheet] : []),
  ];
  return [...new Set(references.map((assetPath) => `comics/${validated.slug}/${assetPath}`))];
}
