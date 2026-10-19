import { notFound } from "next/navigation";

import { ReaderShell } from "@/components/reader-shell";
import {
  comicImageMetadata, comicKeywords, comicMetaDescription, comicMetaTitle, comicSchema, firstImagePath, getComic,
  getNextComic, imageSize,
} from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { SITE_NAME } from "@/lib/site";
import { comicThemes, relatedComics, themePath } from "@/lib/themes";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const comic = getComic(await loadRuntimeComics(), slug);
  if (!comic) return {};
  const title = comicMetaTitle(comic);
  const description = comicMetaDescription(comic);
  const images = comicImageMetadata(comic);
  return {
    title: { absolute: title },
    description,
    keywords: comicKeywords(comic),
    authors: [{ name: SITE_NAME }],
    alternates: {
      canonical: `/comics/${comic.slug}/`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/comics/${comic.slug}/`,
      publishedTime: comic.published_at,
      modifiedTime: comic.updated_at || comic.published_at,
      authors: [SITE_NAME],
      section: "Biography Comics",
      tags: comicKeywords(comic),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

// Client components receive only the fields their cards render.
function comicCard(comic) {
  const size = imageSize(comic, comic.pages?.[0] || "");
  return {
    slug: comic.slug,
    person: comic.person,
    dek: comic.dek || "",
    years: comic.years || "",
    cover: firstImagePath(comic),
    width: size.width,
    height: size.height,
  };
}

export default async function ComicPage({ params }) {
  const { slug } = await params;
  const comics = await loadRuntimeComics();
  const comic = getComic(comics, slug);
  if (!comic) notFound();
  const nextComic = getNextComic(comics, comic.slug);
  const themes = comicThemes(comic).map((theme) => ({ slug: theme.slug, name: theme.name, href: themePath(theme) }));
  const related = relatedComics(comics, comic, 6).map(comicCard);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(comicSchema(comic)) }} />
      <ReaderShell comic={comic} nextComic={nextComic ? comicCard(nextComic) : null} themes={themes} related={related} />
    </>
  );
}
