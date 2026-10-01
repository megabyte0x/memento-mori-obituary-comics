import Link from "next/link";

import { FaqSection } from "@/components/faq-section";
import { ResourceLayout } from "@/components/resource-layout";
import { comicPath } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "A plain-language explainer on obituary comics: how visual obituaries differ from death notices, memorial pages, biography comics, and grief comics.";

const faqs = [
  {
    question: "What are obituary comics?",
    answer:
      "At Final Notes, an obituary comic is a short biographical story told through sequential art, with a written introduction and linked sources. Each story explores a life through death, illness, exile, violence, grief, or loss. The term describes the format used by this archive; readers may also encounter it in other contexts.",
  },
  {
    question: "How are obituary comics different from a normal obituary?",
    answer:
      "An obituary article tells a life story in prose and may include death and service details. A comic uses a sequence of images, captions, and scenes. At Final Notes, the focus is a biographical episode and its place in the subject's life, rather than announcing a recent death or arranging a funeral.",
  },
  {
    question: "Are obituary comics real biographies or fiction?",
    answer:
      "Final Notes comics are based on real people and historical sources. Artwork, scene selection, and judgments about a life are interpretive. A listed source does not independently verify every detail in a panel; compare specific claims with the linked material and distinguish the historical record from the comic's framing.",
  },
  {
    question: "Who reads obituary comics?",
    answer:
      "The archive is intended for readers interested in biography, history, and mortality. Educators and librarians can use the introductions and source links as starting points for discussion and further research. Suitability for a class depends on the subject matter and the teacher's review; classroom testing or endorsement is not implied.",
  },
];

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
    title: "They give readers a path to further research",
    text: "The introduction explains who the subject was and what the comic follows. Linked sources let readers examine the record and pursue questions beyond the artwork.",
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

export default async function WhatAreObituaryComicsPage() {
  const comics = await loadRuntimeComics();
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
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/what-are-obituary-comics/#webpage` },
        keywords: ["obituary comics", "visual obituaries", "obituary stories", "biographical comics"],
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
            At Final Notes, an obituary comic is a short biographical story told through sequential art, accompanied by a written introduction and linked sources. These visual life stories explore death, illness, exile, violence, grief, or another encounter with mortality. The comic selects episodes from a real person's life and interprets their significance. Some stories concern events long before the subject's death, rather than a recent death announcement.
          </p>
          <p>
            Prose obituaries and comics can both tell a life story. Sequential art adds a visual rhythm through scenes, captions, and recurring objects. That interpretation needs to be read alongside the historical record: an evocative panel is not itself evidence that an event happened exactly as drawn.
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

        <section className="explainer-body" aria-labelledby="check-story" style={{ margin: "34px 0" }}>
          <h2 id="check-story">Read The Story And Check The Sources</h2>
          <p>
            Start with the reader introduction, then follow the comic pages. Use the source list to check names, dates, events, and historical context. Museums, archives, reference works, and reporting can offer different kinds of evidence; compare the specific claim with what a source actually says.
          </p>
          <p>
            Story notes explain the comic's chosen turning point. Connections between an episode and later work may be interpretation rather than a documented cause. For research or classroom use, cite the underlying source for historical claims and the comic for its visual treatment. The <Link href="/about/">editorial method</Link> explains the archive's source approach.
          </p>
        </section>

        <section className="explainer-body" aria-labelledby="fictional-series" style={{ margin: "34px 0" }}>
          <h2 id="fictional-series">Looking For Obituary, The Fictional Series?</h2>
          <p>
            <a href="https://www.obituarycartoon.com/">Obituary by Michael and Zara Barryte</a> follows a teenager raised by ghosts. Its official site links to the episodes. This page explains the biographical format used at Final Notes.
          </p>
        </section>

        <FaqSection
          heading="Obituary Comics FAQ"
          path="/what-are-obituary-comics/"
          items={faqs}
        />

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
