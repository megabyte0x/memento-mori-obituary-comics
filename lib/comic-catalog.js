export const CATALOG_OBJECT_KEY = "catalog/comics.json";

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
  if (
    assetPath.startsWith("/")
    || assetPath.includes("\\")
    || assetPath.split("/").some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error(`${slug} has an unsafe ${field}`);
  }
  return assetPath;
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
  comic.published_at = requiredText(comic.published_at, "published_at", slug);

  if (!Array.isArray(comic.pages) || comic.pages.length === 0) {
    throw new Error(`${slug} is missing pages`);
  }
  comic.pages = comic.pages.map((page) => safeAssetPath(page, slug, "page"));

  for (const field of ["pdf", "contact_sheet"]) {
    if (comic[field]) comic[field] = safeAssetPath(comic[field], slug, field);
  }

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
  const nextComic = validateComic(comic);
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
