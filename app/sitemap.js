import { loadRuntimeComics } from "../lib/runtime-comics.js";
import { comicMediaPath } from "../lib/media-paths.js";
import { absoluteUrl } from "../lib/site.js";
import { themePath, themesWithComics } from "../lib/themes.js";

export const dynamic = "force-dynamic";

// Guide pages carry no lastmod: their content changes rarely, and stamping them
// with each comic's publish date would advertise changes that never happened.
const RESOURCE_PATHS = [
  "/obituary-stories/",
  "/obituary-articles/",
  "/obituary-lesson-plan/",
  "/obituary-research-guide/",
  "/obituary-vs-death-notice/",
  "/obituary-vs-eulogy/",
  "/what-not-to-include-in-an-obituary/",
  "/fake-obituary-sites/",
  "/how-to-submit-an-obituary-to-a-newspaper/",
  "/obituary-cost/",
  "/obituary-checklist/",
  "/obituary-mistakes-to-avoid/",
  "/short-obituary-examples/",
  "/free-obituary-generator/",
  "/obituary-wording/",
  "/memorial-donation-wording-obituary/",
  "/how-to-write-an-obituary-story/",
  "/obituary-writing-prompts/",
  "/life-story-obituary-template/",
  "/obituary-examples/",
  "/what-are-obituary-comics/",
  "/educators-libraries/",
  "/press/",
  "/obituary-story-worksheet/",
  "/about/",
  "/newsletter/",
];

function newestDate(comics) {
  return comics.reduce((max, comic) => {
    const date = comic.updated_at || comic.published_at || "";
    return date > max ? date : max;
  }, "");
}

export default async function sitemap() {
  const comics = await loadRuntimeComics();
  const latest = newestDate(comics);
  const themes = themesWithComics(comics);
  return [
    { url: absoluteUrl("/"), ...(latest ? { lastModified: latest } : {}) },
    { url: absoluteUrl("/themes/"), ...(latest ? { lastModified: latest } : {}) },
    ...themes.map(({ theme, comics: members }) => ({
      url: absoluteUrl(themePath(theme)),
      lastModified: newestDate(members),
    })),
    ...RESOURCE_PATHS.map((path) => ({ url: absoluteUrl(path) })),
    ...comics.map((comic) => ({
      url: absoluteUrl(`/comics/${comic.slug}/`),
      lastModified: comic.updated_at || comic.published_at || latest,
      images: comic.pages.map((page) => absoluteUrl(comicMediaPath(comic, page))),
    })),
  ];
}
