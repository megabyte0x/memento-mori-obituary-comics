import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, sourceItems } from "@/lib/comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "Obituary articles as reported life stories: how obituary journalism differs from a notice, eulogy, or template, with source-backed visual obituary examples.";

const articleStructures = [
  {
    title: "Reported obituary article",
    text: "Start with the verified death, then report the life: public record, interviews, work, place, relationships, and the detail that explains why this life matters to readers.",
  },
  {
    title: "Feature obituary article",
    text: "Use one scene, pressure point, quote, object, or contradiction as the lead, then move through the verified life story with enough context for readers who never met the person.",
  },
  {
    title: "Family-history obituary article",
    text: "Build from records, clippings, photographs, letters, and family memory. Keep source notes visible so descendants can separate evidence from interpretation.",
  },
  {
    title: "Visual obituary article",
    text: "Pair a short article structure with images or comic panels: fact, pressure point, action, legacy, and source trail.",
  },
];

const articleComparisons = [
  {
    title: "Death notice",
    text: "Primarily announces a death and service information. It is often short, practical, and constrained by a newspaper or funeral-home form.",
  },
  {
    title: "Eulogy",
    text: "Spoken for mourners at a service. It can be warmer, more intimate, and less article-like because the audience already knows the context.",
  },
  {
    title: "Obituary article",
    text: "A reported or edited article that explains a life for public readers, using facts, quotes, scenes, chronology, and editorial judgment.",
  },
  {
    title: "Visual obituary",
    text: "A source-backed obituary article adapted into images, captions, panels, or visual biography while keeping the factual trail readable.",
  },
];

const classroomUses = [
  "Journalism classes comparing news obituaries, features, profiles, and paid notices.",
  "Writing classes teaching how one concrete detail changes a generic tribute into a readable article.",
  "Library and genealogy workshops that turn obituary records into sourced family-history narratives.",
  "Deathcare and grief-writing resources that need article examples beyond fill-in-the-blank templates.",
];

const referenceLinks = [
  {
    label: "Poynter obituary challenge",
    href: "https://www.poynter.org/reporting-editing/2003/summing-up-a-life-meeting-the-obituarys-challenge/",
    note: "Journalism guidance on reporting a death and summing up a life with accuracy, speed, and sensitivity.",
  },
  {
    label: "Poynter feature obituaries",
    href: "https://www.poynter.org/reporting-editing/2021/obituaries-are-important-worth-rethinking-and-reviving/",
    note: "A newsroom view of local feature obituaries and why readers still value them.",
  },
  {
    label: "Northeastern obituary writing",
    href: "https://news.northeastern.edu/2016/12/14/the-craft-essence-and-importance-of-obituary-writing/",
    note: "School of Journalism article on obituary writing as storytelling, teaching, and accuracy work.",
  },
  {
    label: "ASJA obituary writing",
    href: "https://www.asja.org/how-to-write-obituaries/",
    note: "Professional writer guidance on researching and writing obituaries.",
  },
  {
    label: "JEA writing curriculum",
    href: "https://jea.org/curriculum-library/writing/",
    note: "Journalism Education Association writing resources for journalism classrooms.",
  },
  {
    label: "CJR submission guidelines",
    href: "https://www.cjr.org/about_us/submission-guidelines.php",
    note: "Pitch guidance for journalism stories that explain how the press works and why the topic matters now.",
  },
];

export const metadata = {
  title: "Obituary Articles and Visual Life Stories",
  description,
  keywords: [
    "obituary articles",
    "obituary article",
    "obituary journalism",
    "feature obituary",
    "visual obituary article",
    "obituary stories",
    "reported obituary",
    "obituary writing article",
  ],
  alternates: {
    canonical: "/obituary-articles/",
  },
  openGraph: {
    type: "article",
    title: `Obituary Articles and Visual Life Stories | ${SITE_NAME}`,
    description,
    url: "/obituary-articles/",
  },
  twitter: {
    title: `Obituary Articles and Visual Life Stories | ${SITE_NAME}`,
    description,
  },
};

export default function ObituaryArticlesPage() {
  const comics = getComics();
  const latestDate = comics.reduce((max, comic) => (comic.published_at > max ? comic.published_at : max), "2026-06-04");
  const featured = comics.slice(0, 5);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": ["Article", "CreativeWork"],
        "@id": `${SITE_URL}/obituary-articles/#article`,
        headline: "Obituary Articles and Visual Life Stories",
        name: "Obituary Articles and Visual Life Stories",
        url: absoluteUrl("/obituary-articles/"),
        description,
        inLanguage: SITE_LANGUAGE,
        datePublished: "2026-06-04",
        dateModified: latestDate,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/obituary-articles/#webpage` },
        about: ["obituary articles", "obituary journalism", "feature obituaries", "visual obituaries"],
        mainEntity: {
          "@type": "ItemList",
          name: "Obituary article structures",
          itemListElement: articleStructures.map((structure, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: structure.title,
            description: structure.text,
          })),
        },
        citation: referenceLinks.map((reference) => reference.href),
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/obituary-articles/#collection`,
        name: "Source-backed obituary article examples",
        url: absoluteUrl("/obituary-articles/"),
        description,
        inLanguage: SITE_LANGUAGE,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          name: "Visual obituary article examples",
          itemListElement: featured.map((comic, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(comicPath(comic)),
            name: `${comic.person} - ${comic.title}`,
            description: comic.dek || comic.mortality_event || "",
          })),
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/obituary-articles/#webpage`,
        name: "Obituary Articles and Visual Life Stories",
        url: absoluteUrl("/obituary-articles/"),
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
      <SiteNav />
      <main className="wrap section about-page explainer-page articles-page">
        <article>
          <header className="about-header-section explainer-header-section">
            <div className="kicker">Obituary articles</div>
            <h1>Obituary Articles</h1>
            <p>{description}</p>
            <div className="stories-actions">
              <Button asChild variant="primary">
                <Link href="/obituary-stories/">Read obituary stories</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-examples/">Article examples</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-lesson-plan/">Lesson plan</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-research-guide/">Research guide</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-vs-death-notice/">Notice explainer</Link>
              </Button>
              <Button asChild>
                <Link href="/how-to-write-an-obituary-story/">Writing guide</Link>
              </Button>
              <Button asChild>
                <Link href="/life-story-obituary-template/">Template</Link>
              </Button>
            </div>
          </header>

          <section className="explainer-body" aria-labelledby="what-is-an-obituary-article">
            <h2 id="what-is-an-obituary-article">What Is An Obituary Article?</h2>
            <p>
              An obituary article is a reported life story written after a death. It can appear in a newspaper, magazine, school publication, memorial site, family-history project, or visual biography archive. It is broader than a death notice because it tries to show the person in context.
            </p>
            <p>
              The best obituary articles are accurate first. They check names, dates, places, family relationships, work, service, and claims before adding scenes, quotes, visual details, or interpretation. That is why every FinalNotes reader page keeps source links, summaries, and citation notes near the comic.
            </p>
          </section>

          <section className="explainer-principles" aria-labelledby="article-structures">
            <div>
              <div className="kicker">Article forms</div>
              <h2 id="article-structures">Four Obituary Article Structures</h2>
            </div>
            <div className="stories-intent-list">
              {articleStructures.map((structure) => (
                <article key={structure.title}>
                  <h3>{structure.title}</h3>
                  <p>{structure.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="worksheet-grid" aria-labelledby="article-differences">
            <div>
              <div className="kicker">Use the right form</div>
              <h2 id="article-differences">Article, Notice, Eulogy, Or Visual Obituary?</h2>
            </div>
            <div className="worksheet-fields">
              {articleComparisons.map((item) => (
                <section className="worksheet-box" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="explainer-body" aria-labelledby="classroom-uses">
            <h2 id="classroom-uses">Journalism And Classroom Uses</h2>
            <p>
              Obituary articles are useful teaching texts because they combine reporting, profile writing, ethics, structure, sensitivity, and fact-checking in a compact form.
            </p>
            <ul className="writing-guide-list">
              {classroomUses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="explainer-next" aria-labelledby="source-backed-examples">
            <div>
              <div className="kicker">Archive examples</div>
              <h2 id="source-backed-examples">Source-Backed Obituary Article Examples</h2>
            </div>
            <ul className="press-subject-list">
              {featured.map((comic) => {
                const sources = sourceItems(comic)
                  .map((source) => source.name)
                  .slice(0, 3)
                  .join(", ");
                return (
                  <li key={comic.slug}>
                    <Link href={comicPath(comic)}>{comic.person}: {comic.title}</Link>
                    <p>{comic.dek}</p>
                    <span>{comic.published_at || "Undated"} - {comic.mortality_event || "Visual obituary"} - Sources: {sources || "listed on the reader page"}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="explainer-next" aria-labelledby="references">
            <div>
              <div className="kicker">Further reference</div>
              <h2 id="references">Obituary Article And Journalism Resources</h2>
            </div>
            <div className="press-link-list prompts-reference-list">
              {referenceLinks.map((reference) => (
                <a className="press-link-card" href={reference.href} key={reference.href} rel="noreferrer" target="_blank">
                  <span>{reference.label}</span>
                  <strong>{reference.href}</strong>
                  <em>{reference.note}</em>
                </a>
              ))}
            </div>
          </section>

          <section className="about-card stories-link-box" aria-labelledby="best-link">
            <div>
              <h2 id="best-link">Best Link Target For Obituary Article Pages</h2>
              <p>
                Use this page for journalism lessons, article-writing resources, obituary-writing essays, classroom reading lists, and media criticism about obituaries as reported life stories. For classroom-ready steps, link to the <Link href="/obituary-lesson-plan/">obituary lesson plan</Link>. For genealogy research and obituary search resources, link to the <Link href="/obituary-research-guide/">obituary research guide</Link>. For newspaper/funeral-home pages explaining notice formats, link to the <Link href="/obituary-vs-death-notice/">obituary vs death notice explainer</Link>. For pages comparing written obituaries with spoken tributes, link to the <Link href="/obituary-vs-eulogy/">obituary vs eulogy explainer</Link>. For the full story archive, link to <Link href="/obituary-stories/">obituary stories and articles</Link>. For copyable forms, link to the <Link href="/life-story-obituary-template/">life story obituary template</Link>.
              </p>
            </div>
            <Link href="/obituary-articles/">{absoluteUrl("/obituary-articles/")}</Link>
          </section>
        </article>
      </main>
      <footer>
        Obituary articles as source-backed visual biography. <Link href="/about/">Read the editorial method</Link>.
      </footer>
    </>
  );
}
