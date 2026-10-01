import rawComics from "../comics.json" with { type: "json" };

import {
  absoluteUrl,
  publisherSchema,
  SITE_CATEGORY,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_SHORT_NAME,
  SITE_URL,
} from "./site.js";
import {
  citationPassage, citableSummary, comicDescription, compactText, firstImagePath,
  imageSize, mediaPath, pageSummary, sourceItems,
} from "./comic-presenters.js";

export {
  citationPassage, citableSummary, comicDescription, compactText, firstImagePath,
  imageSize, mediaPath, pageSummary, sourceItems, sourceNames, storyNotes,
} from "./comic-presenters.js";

export const comics = rawComics;

export function getComics(items = comics) {
  return Array.isArray(items) ? items : comics;
}

export function getLatestComic(items = comics) {
  return getComics(items)[0] || null;
}

export function getComic(itemsOrSlug = comics, maybeSlug = "") {
  const items = Array.isArray(itemsOrSlug) ? itemsOrSlug : comics;
  const slug = Array.isArray(itemsOrSlug) ? maybeSlug : itemsOrSlug;
  return items.find((comic) => comic.slug === slug) || null;
}

export function getNextComic(itemsOrSlug = comics, maybeSlug = "") {
  const items = Array.isArray(itemsOrSlug) ? itemsOrSlug : comics;
  const slug = Array.isArray(itemsOrSlug) ? maybeSlug : itemsOrSlug;
  if (items.length < 2) return null;
  const index = items.findIndex((comic) => comic.slug === slug);
  if (index === -1) return items[0];
  return items[(index + 1) % items.length];
}

export function selectResearchGuideComics(items = [], featuredSlug = "") {
  const archive = Array.isArray(items) ? items : [];
  const featured = archive.find((comic) => comic.slug === featuredSlug) || archive[0] || null;
  const latest = archive.find((comic) => comic.slug !== featured?.slug) || null;
  const selectedSlugs = new Set([featured?.slug, latest?.slug].filter(Boolean));
  const remaining = archive.filter((comic) => !selectedSlugs.has(comic.slug)).slice(0, 4);

  return { featured, latest, remaining };
}

export function comicPath(comic) {
  return `/comics/${comic.slug}/`;
}

export function comicUrl(comic) {
  return absoluteUrl(comicPath(comic));
}

export function firstImageUrl(comic) {
  const path = firstImagePath(comic);
  return path ? absoluteUrl(path) : "";
}

export function comicImageMetadata(comic) {
  const image = comic?.pages?.[0] || "";
  const url = firstImageUrl(comic);
  if (!url) return [];
  const size = imageSize(comic, image);
  return [
    {
      url,
      ...(size.width ? { width: size.width } : {}),
      ...(size.height ? { height: size.height } : {}),
      alt: `${comic.person} obituary comic cover for ${comic.title}`,
    },
  ];
}

export function sourceUrls(comic) {
  return sourceItems(comic).map((source) => source.url).filter(Boolean);
}

export function comicKeywords(comic) {
  return [
    `${comic.person} obituary comic`,
    `${comic.person} biography comic`,
    `${comic.person} memento mori`,
    comic.title,
    comic.mortality_event,
    ...SITE_KEYWORDS,
  ]
    .filter(Boolean)
    .map((keyword) => String(keyword).trim())
    .filter(Boolean);
}

export function parseYears(years = "") {
  const text = String(years);
  const values = text.match(/\d{4}/g) || [];
  const approximateBirth = /(?:c\.?|circa)\s*\d{4}/i.test(text);
  return { birthDate: approximateBirth ? "" : values[0] || "", deathDate: values[1] || "" };
}

export function comicMetaTitle(comic) {
  const storyTitle = String(comic.title || "")
    .replace(new RegExp(`^${String(comic.person || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*`, "i"), "")
    .trim();
  const detailed = `${comic.person}: ${storyTitle} Obituary Comic | ${SITE_SHORT_NAME}`;
  const concise = `${comic.person} Obituary Comic | ${SITE_SHORT_NAME}`;
  return detailed.length <= 60 ? detailed : compactText(concise, 60);
}

export function comicMetaDescription(comic) {
  const dek = String(comic.dek || "").replace(/\.$/, "").trim();
  return compactText(
    `${comic.person} obituary comic: ${dek}. A source-backed visual biography about mortality, work, and what remains.`,
    160,
  );
}

export function homeSchema(items = comics) {
  const archive = getComics(items);
  const latest = getLatestComic(archive);
  const latestDate = latest?.published_at || "";
  return {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: SITE_DESCRIPTION,
        inLanguage: SITE_LANGUAGE,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/#collection`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: SITE_DESCRIPTION,
        inLanguage: SITE_LANGUAGE,
        genre: SITE_CATEGORY,
        ...(latestDate ? { dateModified: latestDate } : {}),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          name: "Obituary comic archive",
          itemListElement: archive.map((comic, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: comicUrl(comic),
            name: `${comic.person} - ${comic.title}`,
          })),
        },
      },
    ],
  };
}

export function comicSchema(comic) {
  const { birthDate, deathDate } = parseYears(comic.years);
  const sources = sourceItems(comic);
  const pageUrl = comicUrl(comic);
  const imageUrl = firstImageUrl(comic);
  const keywords = comicKeywords(comic);
  const passage = citationPassage(comic);
  const subject = {
    "@type": "Person",
    "@id": `${pageUrl}#subject`,
    name: comic.person,
    description: comic.dek || "",
    ...(Array.isArray(comic.sameAs) && comic.sameAs.length ? { sameAs: comic.sameAs } : {}),
    ...(birthDate ? { birthDate } : {}),
    ...(deathDate ? { deathDate } : {}),
    ...(sources.length
      ? {
          subjectOf: sources.map((source) => ({
            "@type": "CreativeWork",
            name: source.name,
            ...(source.url ? { url: source.url } : {}),
          })),
        }
      : {}),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${comic.person} Obituary Comic - ${comic.title}`,
        description: comicDescription(comic),
        ...(passage ? { abstract: passage } : {}),
        inLanguage: SITE_LANGUAGE,
        datePublished: comic.published_at || "",
        dateModified: comic.updated_at || comic.published_at || "",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        about: { "@id": `${pageUrl}#subject` },
        mainEntity: { "@id": `${pageUrl}#creative-work` },
        ...(imageUrl ? { primaryImageOfPage: { "@id": `${pageUrl}#primary-image` } } : {}),
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": ["CreativeWork", "ComicStory"],
        "@id": `${comicUrl(comic)}#creative-work`,
        name: `${comic.person} - ${comic.title}`,
        headline: `${comic.person} Obituary Comic - ${comic.title}`,
        description: comicDescription(comic),
        ...(passage ? { abstract: passage } : {}),
        url: pageUrl,
        inLanguage: SITE_LANGUAGE,
        isAccessibleForFree: true,
        keywords,
        ...(imageUrl ? { image: { "@id": `${pageUrl}#primary-image` } } : {}),
        datePublished: comic.published_at || "",
        dateModified: comic.updated_at || comic.published_at || "",
        publisher: { "@id": `${SITE_URL}/#organization` },
        author: { "@id": `${SITE_URL}/#organization` },
        creator: { "@id": `${SITE_URL}/#organization` },
        about: { "@id": `${pageUrl}#subject` },
        mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
        ...(sourceUrls(comic).length ? { citation: sourceUrls(comic) } : {}),
        ...(comic.pdf
          ? {
              encoding: {
                "@type": "MediaObject",
                encodingFormat: "application/pdf",
                contentUrl: absoluteUrl(mediaPath(comic, comic.pdf)),
              },
            }
          : {}),
        hasPart: (comic.pages || []).map((src, index) => {
          if (index === 0 && imageUrl) return { "@id": `${pageUrl}#primary-image` };
          const size = imageSize(comic, src);
          return {
            "@type": "ImageObject",
            "@id": `${pageUrl}#page-${index + 1}`,
            contentUrl: absoluteUrl(mediaPath(comic, src)),
            caption: pageSummary(comic, index + 1) || `Page ${index + 1} of ${comic.person}: ${comic.title}`,
            ...(size.width ? { width: size.width } : {}),
            ...(size.height ? { height: size.height } : {}),
            creator: { "@id": `${SITE_URL}/#organization` },
          };
        }),
      },
      ...(imageUrl
        ? [
            {
              "@type": "ImageObject",
              "@id": `${pageUrl}#primary-image`,
              contentUrl: imageUrl,
              caption: pageSummary(comic, 1) || `${comic.person} obituary comic cover for ${comic.title}`,
              ...(imageSize(comic, comic.pages?.[0] || "").width ? { width: imageSize(comic, comic.pages[0]).width } : {}),
              ...(imageSize(comic, comic.pages?.[0] || "").height ? { height: imageSize(comic, comic.pages[0]).height } : {}),
              representativeOfPage: true,
              creator: { "@id": `${SITE_URL}/#organization` },
            },
          ]
        : []),
      subject,
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#summary`,
        name: `${comic.person} citable summary`,
        itemListElement: citableSummary(comic).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: comic.person, item: pageUrl },
        ],
      },
    ],
  };
}
