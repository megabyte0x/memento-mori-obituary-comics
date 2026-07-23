import { notFound } from "next/navigation";

import { ReaderShell } from "@/components/reader-shell";
import { comicImageMetadata, comicKeywords, comicMetaDescription, comicMetaTitle, comicSchema, getComic, getNextComic } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { SITE_NAME } from "@/lib/site";

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
      section: "Obituary Comics",
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

export default async function ComicPage({ params }) {
  const { slug } = await params;
  const comics = await loadRuntimeComics();
  const comic = getComic(comics, slug);
  if (!comic) notFound();
  const nextComic = getNextComic(comics, comic.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(comicSchema(comic)) }} />
      <ReaderShell comic={comic} nextComic={nextComic} />
    </>
  );
}
