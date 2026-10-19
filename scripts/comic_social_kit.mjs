#!/usr/bin/env node
// Build ready-to-post social copy for one comic so the publishing agent can
// share every new issue to Instagram, Pinterest, and short-text networks.
//
//   node scripts/comic_social_kit.mjs --slug <slug>
//   node scripts/comic_social_kit.mjs --metadata-file path/to/comic.json [--out kit.json]
//
// The comic pages are 720x1280 portrait images, so they can be posted as an
// Instagram/Threads carousel or Pinterest pins without re-rendering.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { clipWords, firstSentence } from "../lib/comics.js";
import { pageSummary, pageTranscript, storyTitle } from "../lib/comic-presenters.js";
import { comicThemes, primaryTheme } from "../lib/themes.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = (process.env.FINALNOTES_SITE_URL || "https://www.finalnotes.page").replace(/\/+$/, "");

const THEME_HASHTAGS = {
  cancer: ["cancerawareness", "cancerresearch"],
  illness: ["chronicillness", "medicalhistory"],
  blindness: ["blindness", "braille"],
  disability: ["disabilityhistory", "disabilitypride"],
  holocaust: ["holocaustremembrance", "neveragain"],
  prison: ["prisonliterature", "history"],
  war: ["warhistory", "ww2history"],
  artists: ["arthistory", "artistsoninstagram"],
  writers: ["literature", "booklovers"],
  musicians: ["musichistory", "musiclegends"],
  scientists: ["sciencehistory", "womeninstem"],
  "civil-rights": ["civilrights", "blackhistory"],
  "athletes-explorers": ["sportshistory", "exploration"],
  faith: ["faith", "philosophy"],
  women: ["womenshistory", "womeninhistory"],
};

function link(comic, source) {
  return `${SITE}/comics/${comic.slug}/?utm_source=${source}&utm_medium=social&utm_campaign=comic_${comic.slug}`;
}

function pageAltText(comic, index) {
  const transcript = pageTranscript(comic, index);
  const caption = transcript.match(/^Caption:\s*(.+)$/m)?.[1] || "";
  const summary = pageSummary(comic, index);
  return clipWords(
    [`Page ${index} of a comic about ${comic.person}.`, summary, caption ? `Caption: ${caption}` : ""].filter(Boolean).join(" "),
    1000,
  );
}

export function buildSocialKit(comic) {
  const story = storyTitle(comic) || comic.title;
  const themes = comicThemes(comic);
  const hashtags = [
    "biography",
    "comics",
    "history",
    ...themes.flatMap((theme) => THEME_HASHTAGS[theme.slug] || []),
    comic.person.replace(/[^A-Za-z0-9]/g, "").toLowerCase(),
  ];
  const tags = [...new Set(hashtags)].slice(0, 12).map((tag) => `#${tag}`).join(" ");
  const who = firstSentence(comic.citation_passage || "") || comic.dek;
  const pages = (comic.pages || []).map((page, index) => ({
    page,
    url: `${SITE}/media/comics/${comic.slug}/${page}`,
    alt_text: pageAltText(comic, index + 1),
  }));

  return {
    slug: comic.slug,
    reader_url: `${SITE}/comics/${comic.slug}/`,
    share_image: `${SITE}/share-card/${comic.slug}.jpg`,
    life_dates: { birth_date: comic.birth_date || null, death_date: comic.death_date || null },
    instagram_carousel: {
      slides: pages.slice(0, 10),
      caption: [
        `${comic.person}: ${story}`,
        comic.dek,
        who,
        `Read all ${pages.length} pages free, with sources: link in bio.`,
        tags,
      ].filter(Boolean).join("\n\n"),
      link_in_bio: link(comic, "instagram"),
    },
    pinterest_pins: pages.slice(0, 3).map((page, index) => ({
      image_url: page.url,
      title: clipWords(`${comic.person}: ${story} | Illustrated biography`, 100),
      description: clipWords(`${who} ${comic.dek || ""} Read the free illustrated biography comic.`, 500),
      alt_text: page.alt_text,
      link: link(comic, "pinterest"),
      board: primaryTheme(comic)?.title || "Illustrated biographies",
      ...(index ? {} : { is_cover: true }),
    })),
    short_post: {
      text: clipWords(`${comic.person} (${comic.years}). ${comic.dek}`, 240),
      link: link(comic, "social"),
      image_url: `${SITE}/share-card/${comic.slug}.jpg`,
    },
  };
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index === -1 ? null : argv[index + 1] || null;
}

export function main(argv = process.argv.slice(2)) {
  const metadataFile = valueAfter(argv, "--metadata-file");
  const slug = valueAfter(argv, "--slug");
  if (!metadataFile && !slug) throw new Error("--slug or --metadata-file is required");
  const filePath = metadataFile ? path.resolve(metadataFile) : path.join(ROOT, "comics", slug, "comic.json");
  const kit = buildSocialKit(JSON.parse(readFileSync(filePath, "utf8")));
  const out = valueAfter(argv, "--out");
  const json = `${JSON.stringify(kit, null, 2)}\n`;
  if (out) writeFileSync(path.resolve(out), json);
  else process.stdout.write(json);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
