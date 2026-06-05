import Link from "next/link";

import { ResourceLayout } from "@/components/resource-layout";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, getLatestComic } from "@/lib/comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "A plain-language explainer on obituary comics: how visual obituaries differ from death notices, memorial pages, biography comics, and grief comics.";

const sections = [
  {
    title: "They are not death notices",
    text: "A death notice records that someone died. An obituary comic asks what a life looked like at the moment mortality put pressure on it, then gives that moment a visual sequence.",
  },
  {
    title: "They need evidence",
    text: "The comic can be interpretive, but the page around it should carry dates, context, source links, captions, and summaries that make the story checkable.",
  },
  {
    title: "They work well for hard lives",
    text: "Illness, exile, imprisonment, violence, grief, and late-career reinvention are difficult to compress into a generic tribute. Sequential art can slow the reader down without turning the subject into a slogan.",
  },
  {
    title: "They are useful to readers and crawlers",
    text: "Images create the reading experience, while structured text, citations, and JSON-LD help search engines, AI answer systems, librarians, teachers, and editors understand the factual frame.",
  },
];

export const metadata = {
  title: "What Are Obituary Comics?",
  description,
  keywords: [
    "what are obituary comics",
    "obituary comics",
    "visual obituaries",
    "obituary stories",
    "grief comics",
    "biographical comics",
  ],
  alternates: {
    canonical: "/what-are-obituary-comics/",
  },
  openGraph: {
    type: "article",
    title: `What Are Obituary Comics? | ${SITE_NAME}`,
    description,
    url: "/what-are-obituary-comics/",
  },
  twitter: {
    title: `What Are Obituary Comics? | ${SITE_NAME}`,
    description,
  },
};

export default function WhatAreObituaryComicsPage() {
  const comics = getComics();
  const latest = getLatestComic();
  const latestDate = comics.reduce((max, comic) => (comic.published_at > max ? comic.published_at : max), "2026-06-04");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "Article",
        "@id": `${SITE_URL}/what-are-obituary-comics/#article`,
        headline: "What Are Obituary Comics?",
        name: "What Are Obituary Comics?",
        url: absoluteUrl("/what-are-obituary-comics/"),
        description,
        inLanguage: SITE_LANGUAGE,
        datePublished: "2026-06-04",
        dateModified: latestDate,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/what-are-obituary-comics/#webpage` },
        about: ["obituary comics", "visual obituaries", "obituary stories", "biographical comics"],
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/what-are-obituary-comics/#webpage`,
        name: "What Are Obituary Comics?",
        url: absoluteUrl("/what-are-obituary-comics/"),
        description,
        inLanguage: SITE_LANGUAGE,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ResourceLayout
        currentPath="/what-are-obituary-comics/"
        kicker="Explainer"
        title="What Are Obituary Comics?"
        description={description}
      >
        <section className="explainer-body" aria-labelledby="definition" style={{ margin: "0 0 34px" }}>
          <h2 id="definition">Definition</h2>
          <p>
            Obituary comics are visual obituary stories. They use sequential art to tell a source-backed life story around death, illness, exile, violence, grief, or another encounter with mortality. The format sits between an obituary article, a short biography comic, and a grief comic: it remembers a life, but it also shows the pressure point that made the life legible.
          </p>
          <p>
            A conventional obituary often moves quickly through birth, education, work, family, survivors, and services. That structure can be useful, but it can also flatten the person into a list. An obituary comic has a different job. It chooses a meaningful moment, gives it visual rhythm, and lets the reader feel the shape of a decision, wound, recovery, or final work.
          </p>
        </section>

        <section className="explainer-principles" aria-labelledby="principles">
          <div>
            <div className="kicker">Principles</div>
            <h2 id="principles">What Makes The Form Work</h2>
          </div>
          <div className="stories-intent-list">
            {sections.map((section) => (
              <article key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="explainer-body" aria-labelledby="why-search" style={{ margin: "34px 0" }}>
          <h2 id="why-search">Why It Matters For Search And Citation</h2>
          <p>
            Obituary comics can fail online when the artwork carries all the meaning and the page gives search engines only a title and a gallery. A useful reader page needs both: image-first storytelling for humans, and text-first evidence for crawlers, researchers, AI search, teachers, and editors.
          </p>
          <p>
            Memento Mori Obituary Comics uses stable reader URLs, citable summaries, source trails, captions, PDF access, sitemap entries, canonical metadata, and structured data. That gives each visual obituary a better chance of being understood as an obituary story rather than a loose image post.
          </p>
        </section>

        <section className="explainer-next" aria-labelledby="next-reading">
          <div>
            <div className="kicker">Next reading</div>
            <h2 id="next-reading">Start With The Archive</h2>
          </div>
          <ul className="press-subject-list">
            {comics.slice(0, 5).map((comic) => (
              <li key={comic.slug}>
                <Link href={comicPath(comic)}>{comic.person}: {comic.title}</Link>
                <p>{comic.dek}</p>
                <span>{comic.published_at || "Undated"} - {comic.mortality_event || "Visual obituary"}</span>
              </li>
            ))}
          </ul>
        </section>
      </ResourceLayout>
    </>
  );
}

