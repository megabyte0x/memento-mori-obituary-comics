import { loadRuntimeComics } from "../lib/runtime-comics.js";
import { comicMediaPath } from "../lib/media-paths.js";
import { absoluteUrl } from "../lib/site.js";

export const dynamic = "force-dynamic";

const DYNAMIC_RESOURCE_PATHS = [
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
];

const STATIC_RESOURCE_PATHS = [
  "/obituary-story-worksheet/",
  "/about/",
  "/newsletter/",
];

export default async function sitemap() {
  const comics = await loadRuntimeComics();
  const latest = comics.reduce((max, comic) => (comic.published_at > max ? comic.published_at : max), "");
  return [
    { url: absoluteUrl("/"), ...(latest ? { lastModified: latest } : {}) },
    ...DYNAMIC_RESOURCE_PATHS.map((path) => ({
      url: absoluteUrl(path),
      ...(latest ? { lastModified: latest } : {}),
    })),
    ...STATIC_RESOURCE_PATHS.map((path) => ({ url: absoluteUrl(path) })),
    ...comics.map((comic) => ({
      url: absoluteUrl(`/comics/${comic.slug}/`),
      lastModified: comic.published_at || latest,
      images: comic.pages.map((page) => absoluteUrl(comicMediaPath(comic, page))),
    })),
  ];
}
