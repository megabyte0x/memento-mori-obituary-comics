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
  citationPassage, citableSummary, comicDescription, comicFaq, compactText, firstImagePath,
  imageSize, mediaPath, pageSummary, pageTranscript, sourceItems, storyTitle,
} from "./comic-presenters.js";
import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from "./share-card.js";
import { comicThemes, primaryTheme, themePath } from "./themes.js";

export {
  ageAtDeath, citationPassage, citableSummary, comicDescription, comicFaq, compactText, firstImagePath,
  formatLifeDate, imageSize, lifeFacts, mediaPath, pageSummary, pageTranscript, sourceItems, sourceNames,
  storyNotes, storyTitle,
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

// 1200x630 landscape card for social previews and Google Discover. The agent
// may upload its own `og_image`; otherwise the Worker composes one from the cover.
export function shareCardPath(comic) {
  if (comic?.og_image) return mediaPath(comic, comic.og_image);
  return `/share-card/${comic.slug}.jpg`;
}

export function comicImageMetadata(comic) {
  if (!comic?.slug || !comic?.pages?.length) return [];
  return [
    {
      url: absoluteUrl(shareCardPath(comic)),
      width: SHARE_CARD_WIDTH,
      height: SHARE_CARD_HEIGHT,
      alt: `${comic.person} biography comic: ${storyTitle(comic) || comic.title}`,
    },
  ];
}

export function sourceUrls(comic) {
  return sourceItems(comic).map((source) => source.url).filter(Boolean);
}

export function comicKeywords(comic) {
  return [
    `${comic.person} comic`,
    `${comic.person} biography`,
    `${comic.person} life and death`,
    comic.title,
    comic.mortality_event,
    ...comicThemes(comic).map((theme) => theme.name),
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

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

// Trims at a word boundary so titles and descriptions never end mid-word.
export function clipWords(value, limit) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > limit / 2 ? clipped.slice(0, lastSpace) : clipped).replace(/[ ,;:.–—-]+$/, "")}…`;
}

export function comicMetaTitle(comic) {
  const custom = String(comic.seo_title || "").trim();
  if (custom) return custom;
  const story = storyTitle(comic);
  const years = String(comic.years || "").trim();
  const candidates = [
    story ? `${comic.person}: ${story} | Biography Comic` : "",
    years ? `${comic.person} (${years}) | Biography Comic` : "",
    `${comic.person} | Biography Comic`,
  ].filter(Boolean);
  return candidates.find((candidate) => candidate.length <= TITLE_LIMIT) || candidates.at(-1);
}

const ABBREVIATIONS = new Set(["c", "ca", "st", "dr", "mr", "mrs", "ms", "jr", "sr", "no", "vs", "u.s", "mt"]);

// First sentence, skipping abbreviations ("c. 1822") and initials ("J. R. R.").
export function firstSentence(text = "") {
  const value = String(text).replace(/\s+/g, " ").trim();
  for (const match of value.matchAll(/[.!?](?= [A-Z"“‘(]|$)/g)) {
    const before = value.slice(0, match.index);
    const word = (before.match(/(\S+)$/)?.[1] || "").toLowerCase().replace(/^[("“]/, "");
    if (match[0] === "." && (ABBREVIATIONS.has(word) || /^[a-z]$/.test(word))) continue;
    return value.slice(0, match.index + 1);
  }
  return value;
}

export function comicMetaDescription(comic) {
  const custom = String(comic.seo_description || "").trim();
  if (custom) return clipWords(custom, DESCRIPTION_LIMIT);
  const lead = firstSentence(citationPassage(comic)) || String(comic.dek || "").trim();
  const tails = [" Read the free illustrated biography comic, with sources.", " Read the illustrated biography comic.", " Illustrated biography."];
  const tail = tails.find((candidate) => lead.length + candidate.length <= DESCRIPTION_LIMIT);
  return tail ? `${lead}${tail}` : clipWords(lead, DESCRIPTION_LIMIT);
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
            name: `${comic.person}: ${storyTitle(comic) || comic.title}`,
          })),
        },
      },
    ],
  };
}

export function comicSchema(comic) {
  const years = parseYears(comic.years);
  const birthDate = comic.birth_date || years.birthDate;
  const deathDate = comic.death_date || years.deathDate;
  const faq = comicFaq(comic);
  const theme = primaryTheme(comic);
  const transcript = (comic.pages || []).map((_, index) => pageTranscript(comic, index + 1)).filter(Boolean).join("\n\n");
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
        name: comicMetaTitle(comic),
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
        name: `${comic.person}: ${storyTitle(comic) || comic.title}`,
        headline: `${comic.person}: ${storyTitle(comic) || comic.title}`,
        description: comicDescription(comic),
        ...(passage ? { abstract: passage } : {}),
        url: pageUrl,
        inLanguage: SITE_LANGUAGE,
        genre: "Biographical comic",
        isAccessibleForFree: true,
        keywords,
        ...(transcript ? { text: transcript } : {}),
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
            caption: pageSummary(comic, index + 1) || `Page ${index + 1} of ${comic.person}: ${storyTitle(comic) || comic.title}`,
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
          ...(theme ? [{ "@type": "ListItem", position: 2, name: theme.name, item: absoluteUrl(themePath(theme)) }] : []),
          { "@type": "ListItem", position: theme ? 3 : 2, name: comic.person, item: pageUrl },
        ],
      },
      ...(faq.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${pageUrl}#faq`,
              isPartOf: { "@id": `${pageUrl}#webpage` },
              mainEntity: faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
          ]
        : []),
    ],
  };
}
