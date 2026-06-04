import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, sourceItems } from "@/lib/comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "A practical comparison of an obituary and a eulogy: what each one is for, what to include, which comes first, and how to turn facts into a spoken or written tribute.";

const comparisonRows = [
  {
    label: "Obituary",
    purpose: "A written public notice and life summary, usually published online, in a newspaper, or on a funeral-home page.",
    bestFor: "Informing a wider community, preserving a public record, sharing service details, and summarizing a life for people who may not attend the service.",
    details: "Name, dates, family, places, work, affiliations, service details, donation requests, and one or two personal details that keep the life from becoming only a timeline.",
  },
  {
    label: "Eulogy",
    purpose: "A spoken tribute delivered during a funeral, memorial service, celebration of life, or private gathering.",
    bestFor: "Helping people in the room remember the person through stories, values, voice, humor, gratitude, and grief.",
    details: "A short opening, two or three memories, a thread that explains what those stories reveal, and a closing that can be spoken naturally.",
  },
  {
    label: "Tribute or remembrance",
    purpose: "A flexible memorial message that can be spoken, printed, recorded, posted online, or shared privately.",
    bestFor: "Memorial programs, online tribute walls, family newsletters, video messages, and situations where a full eulogy is not needed.",
    details: "One memory, one value or lesson, a few concrete details, and a tone that fits the audience and setting.",
  },
];

const decisionSteps = [
  {
    title: "Write the obituary first when people need facts",
    text: "If the service date, location, death announcement, or family details need to reach a public audience, start with the obituary. It gives the eulogy writer a verified factual base.",
  },
  {
    title: "Write the eulogy first when the feeling is clearer than the timeline",
    text: "If you are preparing to speak and already know the memories that matter, draft the eulogy first. Later, you can compress its facts and details into an obituary.",
  },
  {
    title: "Do not read the obituary as the eulogy",
    text: "An obituary can help with names and dates, but a eulogy should sound like a person speaking to people who are grieving. Use stories, not just biographical facts.",
  },
  {
    title: "Use one shared fact sheet for both",
    text: "Keep names, dates, service details, spellings, and family relationships in one checked document so the printed obituary and spoken tribute do not contradict each other.",
  },
];

const checklist = [
  "Confirm which facts belong in public before publishing an obituary: names, addresses, cause of death, service location, and family relationships.",
  "For a eulogy, choose two or three stories that can be spoken clearly in the room rather than trying to summarize the entire life.",
  "Adapt the tone to the setting: newspaper readers, funeral guests, a faith service, a celebration of life, or a private family gathering.",
  "Read the eulogy aloud before the service and remove anything that sounds stiff, confusing, too private, or hard to say while grieving.",
  "Preserve the obituary citation for future family-history work, and save the eulogy text separately as a family memory document.",
];

const referenceLinks = [
  {
    label: "Funeral Basics: difference between eulogy and obituary",
    href: "https://www.funeralbasics.org/difference-eulogy-and-obituary/",
    note: "Explains the spoken-vs-written distinction, length differences, and how each form honors a life.",
  },
  {
    label: "Dignity Bereavement Support: obituary vs eulogy",
    href: "https://www.dignitybereavementsupport.com/blog/obituary-vs-eulogy",
    note: "Family-facing guide on purpose, timing, and which piece often comes first.",
  },
  {
    label: "In Tribute Eulogy Services: obituary vs eulogy",
    href: "https://www.intributeeulogyservices.com/post/obituary-vs-eulogy-what-s-the-difference",
    note: "Compares the two formats from a tribute-writing perspective.",
  },
  {
    label: "Grace Memorial Chapel: writing a eulogy and obituary",
    href: "https://gracemortuary.com/resources/writing-a-eulogy-and-obituary/",
    note: "Funeral-home resource page that treats obituary and eulogy drafting as related family tasks.",
  },
  {
    label: "Hartford Funeral Home: eulogies and obituaries",
    href: "https://www.hartfordfh.com/eulogies-obituaries",
    note: "Funeral-home guide with practical eulogy steps and an obituary template.",
  },
  {
    label: "Jones Funeral Home: eulogies and obituaries",
    href: "https://jonesfuneralhome.co/eulogies-obituaries/",
    note: "Funeral-home resource explaining the purpose of eulogies and obituary notices.",
  },
];

export const metadata = {
  title: "Obituary vs Eulogy: What Is the Difference?",
  description,
  keywords: [
    "obituary vs eulogy",
    "eulogy vs obituary",
    "difference between obituary and eulogy",
    "what is a eulogy",
    "what is an obituary",
    "obituary and eulogy examples",
  ],
  alternates: {
    canonical: "/obituary-vs-eulogy/",
  },
  openGraph: {
    type: "article",
    title: `Obituary vs Eulogy | ${SITE_NAME}`,
    description,
    url: "/obituary-vs-eulogy/",
  },
  twitter: {
    title: `Obituary vs Eulogy | ${SITE_NAME}`,
    description,
  },
};

export default function ObituaryVsEulogyPage() {
  const comics = getComics();
  const latestDate = comics.reduce((max, comic) => (comic.published_at > max ? comic.published_at : max), "2026-06-05");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "Article",
        "@id": `${SITE_URL}/obituary-vs-eulogy/#article`,
        headline: "Obituary vs Eulogy: What Is the Difference?",
        name: "Obituary vs Eulogy: What Is the Difference?",
        url: absoluteUrl("/obituary-vs-eulogy/"),
        description,
        inLanguage: SITE_LANGUAGE,
        datePublished: "2026-06-05",
        dateModified: latestDate,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/obituary-vs-eulogy/#webpage` },
        about: ["obituary vs eulogy", "eulogy writing", "obituary writing", "memorial tribute"],
        mainEntity: {
          "@type": "ItemList",
          name: "Obituary, eulogy, and tribute comparison",
          itemListElement: comparisonRows.map((row, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: row.label,
            description: `${row.purpose} Best for: ${row.bestFor}`,
          })),
        },
        citation: referenceLinks.map((reference) => reference.href),
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/obituary-vs-eulogy/#webpage`,
        name: "Obituary vs Eulogy: What Is the Difference?",
        url: absoluteUrl("/obituary-vs-eulogy/"),
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
      <main className="wrap section about-page explainer-page eulogy-page">
        <article>
          <header className="about-header-section explainer-header-section">
            <div className="kicker">Obituary vs eulogy</div>
            <h1>Obituary vs Eulogy</h1>
            <p>{description}</p>
            <div className="stories-actions">
              <Button asChild variant="primary">
                <Link href="/how-to-write-an-obituary-story/">Writing guide</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-vs-death-notice/">Notice explainer</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-writing-prompts/">Prompts</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-story-worksheet/">Worksheet</Link>
              </Button>
            </div>
          </header>

          <section className="explainer-body" aria-labelledby="quick-answer">
            <h2 id="quick-answer">Quick Answer</h2>
            <p>
              An obituary is written for publication. It announces a death, preserves key facts, and may include a short life story. A eulogy is written to be spoken. It helps the people gathered at a funeral or memorial feel who the person was through stories, values, and memory.
            </p>
            <p>
              You can use the same facts for both, but the shape should change. The obituary needs accuracy, public context, and service details. The eulogy needs voice, pace, and a few memories that can be heard clearly in the room.
            </p>
          </section>

          <section className="worksheet-grid" aria-labelledby="comparison">
            <div>
              <div className="kicker">Comparison</div>
              <h2 id="comparison">Obituary, Eulogy, Or Tribute?</h2>
            </div>
            <div className="worksheet-fields">
              {comparisonRows.map((row) => (
                <section className="worksheet-box" key={row.label}>
                  <h3>{row.label}</h3>
                  <p>{row.purpose}</p>
                  <p><strong>Best for:</strong> {row.bestFor}</p>
                  <p><strong>Usually includes:</strong> {row.details}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="explainer-principles" aria-labelledby="decision">
            <div>
              <div className="kicker">Decision guide</div>
              <h2 id="decision">Which One Should You Write First?</h2>
            </div>
            <div className="stories-intent-list">
              {decisionSteps.map((step) => (
                <article key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="explainer-body" aria-labelledby="before-writing">
            <h2 id="before-writing">Before Writing Either One</h2>
            <ul className="writing-guide-list">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="about-card stories-link-box" aria-labelledby="best-link">
            <div>
              <h2 id="best-link">Best Link Target For Obituary And Eulogy Resources</h2>
              <p>
                Use this page for funeral-home planning pages, bereavement resources, eulogy-writing articles, memorial-program guides, and pages explaining the difference between an obituary and a eulogy. For short public announcements, use the <Link href="/obituary-vs-death-notice/">obituary vs death notice explainer</Link>. For a fuller written story, use the <Link href="/how-to-write-an-obituary-story/">obituary story writing guide</Link>. For questions that help gather memories, use the <Link href="/obituary-writing-prompts/">obituary writing prompts page</Link>.
              </p>
            </div>
            <Link href="/obituary-vs-eulogy/">{absoluteUrl("/obituary-vs-eulogy/")}</Link>
          </section>

          <section className="explainer-next" aria-labelledby="references">
            <div>
              <div className="kicker">References</div>
              <h2 id="references">Sources And Related Resources</h2>
            </div>
            <ul className="press-subject-list">
              {referenceLinks.map((reference) => (
                <li key={reference.href}>
                  <a href={reference.href}>{reference.label}</a>
                  <p>{reference.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="explainer-next" aria-labelledby="examples">
            <div>
              <div className="kicker">Examples</div>
              <h2 id="examples">Read Source-Backed Obituary Stories</h2>
            </div>
            <ul className="press-subject-list">
              {comics.slice(0, 4).map((comic) => {
                const sources = sourceItems(comic)
                  .map((source) => source.name)
                  .slice(0, 3)
                  .join(", ");
                return (
                  <li key={comic.slug}>
                    <Link href={comicPath(comic)}>{comic.person}: {comic.title}</Link>
                    <p>{comic.dek}</p>
                    <span>{comic.published_at || "Undated"} - Sources: {sources || "listed on the reader page"}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </article>
      </main>
      <footer>
        Obituaries are written records; eulogies are spoken remembrance. <Link href="/press/">Press and review resources</Link>.
      </footer>
    </>
  );
}
