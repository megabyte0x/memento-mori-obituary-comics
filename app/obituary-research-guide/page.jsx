import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, sourceItems } from "@/lib/comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "An obituary research guide for genealogy, library, and family-history searches: where to look, what facts to verify, and how to turn an obituary record into a sourced life story.";

const researchSteps = [
  {
    title: "Start with identity details",
    text: "Collect full names, nicknames, maiden names, birth and death dates, death place, last residence, spouse or parent names, and any town, church, school, employer, or military clue before searching.",
  },
  {
    title: "Search current web and funeral-home pages",
    text: "For recent deaths, try the person's exact name with obituary, death notice, funeral home, memorial, and city or county terms. Save the page URL, publication date, and funeral-home name before pages move or disappear.",
  },
  {
    title: "Use genealogy indexes and unindexed images",
    text: "Search indexed records first, then browse images, catalogs, and digital-library collections when an index is missing or incomplete. Obituaries are often stored with death records, newspapers, or local-history files.",
  },
  {
    title: "Check local libraries and newspaper rooms",
    text: "When online search fails, local history rooms, public libraries, state newspaper portals, and microfilm collections may hold the missing notice. A death date or article date makes staff lookups much easier.",
  },
  {
    title: "Record the source before writing",
    text: "Write down the newspaper, date, page, database, repository, URL, access date, and any uncertainty. Separate what the obituary proves from what it suggests for later family-history research.",
  },
  {
    title: "Turn clues into a story carefully",
    text: "After the record is found, use names, places, relationships, work, service, and one concrete scene or object to write a life story without stretching beyond the evidence.",
  },
];

const sourceTypes = [
  {
    title: "Indexed obituary databases",
    text: "Best when you know a name, date range, and location. Check spelling variants, initials, married names, and relatives listed in the notice.",
  },
  {
    title: "Unindexed image collections",
    text: "Useful when a collection exists but search does not find the person. Browse by place, date, newspaper title, and record type.",
  },
  {
    title: "Local newspaper and microfilm files",
    text: "Often necessary for older or regional notices. You usually need a death date, article date, or narrow date range before browsing.",
  },
  {
    title: "Funeral-home memorial pages",
    text: "Useful for recent deaths, service details, family names, and guestbook context. Save a citation because hosted memorial pages can change.",
  },
  {
    title: "Cemetery and memorial records",
    text: "Helpful for burial location, family connections, inscriptions, and date checks, but they should be confirmed against stronger records where possible.",
  },
  {
    title: "Library and society vertical files",
    text: "Local history rooms and genealogy societies may keep clipped obituaries, family files, and indexes that are not fully searchable online.",
  },
];

const searchPatterns = [
  "\"Full Name\" obituary \"Town\"",
  "\"Full Name\" \"death notice\" \"County\"",
  "\"Full Name\" \"funeral home\"",
  "\"Surname\" obituary \"newspaper title\"",
  "\"Maiden Name\" \"married name\" obituary",
  "\"Full Name\" \"Find a Grave\"",
];

const referenceLinks = [
  {
    label: "FamilySearch obituary search tips",
    href: "https://www.familysearch.org/en/help/helpcenter/article/find-obituaries-on-familysearch",
    note: "Explains indexed records, images, catalog searches, Family Tree memories, and the Research Wiki.",
  },
  {
    label: "Cyndi's List obituary category",
    href: "https://www.cyndislist.com/obituaries/",
    note: "Genealogy directory category for obituary resources.",
  },
  {
    label: "Cyndi's List submit link",
    href: "https://www.cyndislist.com/submit/",
    note: "Submission path for genealogy-only resource links.",
  },
  {
    label: "Family Tree Magazine obituary guide",
    href: "https://familytreemagazine.com/records/vital/genealogy-guide-obituaries/",
    note: "Genealogy guide to historical obituaries, search terms, and alternate records.",
  },
  {
    label: "The Ancestor Hunt obituary search FAQ",
    href: "https://theancestorhunt.com/wp-content/uploads/2024/03/Obituary-Search-FAQs.pdf",
    note: "Obituary-search FAQ with library, genealogy society, and local collection guidance.",
  },
  {
    label: "Rochester Public Library genealogy guide",
    href: "https://www.rplmn.org/research-learn/genealogy-and-family-history/",
    note: "Public-library example showing obituary finder, local newspaper, index, and microfilm workflow.",
  },
];

export const metadata = {
  title: "Obituary Research Guide for Genealogy and Family History",
  description,
  keywords: [
    "obituary research guide",
    "obituary search guide",
    "find obituary records",
    "genealogy obituary search",
    "free obituary search",
    "obituary records genealogy",
    "family history obituary",
  ],
  alternates: {
    canonical: "/obituary-research-guide/",
  },
  openGraph: {
    type: "article",
    title: `Obituary Research Guide for Genealogy and Family History | ${SITE_NAME}`,
    description,
    url: "/obituary-research-guide/",
  },
  twitter: {
    title: `Obituary Research Guide for Genealogy and Family History | ${SITE_NAME}`,
    description,
  },
};

export default function ObituaryResearchGuidePage() {
  const comics = getComics();
  const latestDate = comics.reduce((max, comic) => (comic.published_at > max ? comic.published_at : max), "2026-06-04");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "Article",
        "@id": `${SITE_URL}/obituary-research-guide/#article`,
        headline: "Obituary Research Guide for Genealogy and Family History",
        name: "Obituary Research Guide for Genealogy and Family History",
        url: absoluteUrl("/obituary-research-guide/"),
        description,
        inLanguage: SITE_LANGUAGE,
        datePublished: "2026-06-04",
        dateModified: latestDate,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/obituary-research-guide/#webpage` },
        about: ["obituary research", "genealogy", "family history", "obituary records", "life story writing"],
        mainEntity: {
          "@type": "ItemList",
          name: "Obituary research steps",
          itemListElement: researchSteps.map((step, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: step.title,
            description: step.text,
          })),
        },
        citation: referenceLinks.map((reference) => reference.href),
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/obituary-research-guide/#webpage`,
        name: "Obituary Research Guide for Genealogy and Family History",
        url: absoluteUrl("/obituary-research-guide/"),
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
      <main className="wrap section about-page explainer-page research-guide-page">
        <article>
          <header className="about-header-section explainer-header-section">
            <div className="kicker">Obituary research guide</div>
            <h1>Obituary Research Guide</h1>
            <p>{description}</p>
            <div className="stories-actions">
              <Button asChild variant="primary">
                <Link href="/how-to-write-an-obituary-story/">Writing guide</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-story-worksheet/">Research worksheet</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-vs-death-notice/">Notice explainer</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-vs-eulogy/">Eulogy explainer</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-examples/">Obituary examples</Link>
              </Button>
              <Button asChild>
                <Link href="/obituary-stories/">Story archive</Link>
              </Button>
            </div>
          </header>

          <section className="explainer-body" aria-labelledby="research-purpose">
            <h2 id="research-purpose">What Obituary Research Can Prove</h2>
            <p>
              Obituary research helps genealogists, librarians, and families move from a name and date to a fuller life record. A useful obituary can confirm relationships, places, occupations, service details, burial information, affiliations, and the words a community used to remember someone.
            </p>
            <p>
              It can also mislead if treated as a perfect record. Names may be misspelled, dates may be rounded, relatives may be omitted, and online indexes may classify unrelated articles as obituaries. Treat the obituary as a strong clue, then compare it with death certificates, cemetery records, census entries, directories, letters, photographs, and local newspapers.
            </p>
          </section>

          <section className="explainer-principles" aria-labelledby="research-steps">
            <div>
              <div className="kicker">Process</div>
              <h2 id="research-steps">Six Steps To Find And Use An Obituary</h2>
            </div>
            <div className="stories-intent-list">
              {researchSteps.map((step) => (
                <article key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="worksheet-grid" aria-labelledby="source-types">
            <div>
              <div className="kicker">Where to look</div>
              <h2 id="source-types">Obituary Search Sources</h2>
            </div>
            <div className="worksheet-fields">
              {sourceTypes.map((source) => (
                <section className="worksheet-box" key={source.title}>
                  <h3>{source.title}</h3>
                  <p>{source.text}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="explainer-body" aria-labelledby="search-patterns">
            <h2 id="search-patterns">Search Patterns To Try</h2>
            <p>
              Start with exact-name searches, then widen by place, relatives, newspaper title, funeral home, cemetery, church, school, employer, and maiden or married names. If one spelling fails, try initials, middle names, common misspellings, and nearby towns.
            </p>
            <ul className="writing-guide-list">
              {searchPatterns.map((pattern) => (
                <li key={pattern}>{pattern}</li>
              ))}
            </ul>
          </section>

          <section className="explainer-body" aria-labelledby="citation-checklist">
            <h2 id="citation-checklist">Citation Checklist</h2>
            <p>
              Before turning an obituary into a family-history story, preserve the citation. Record the deceased person's name, obituary title or first line, newspaper or website, publication date, page or image number, repository, URL, access date, and any visible byline or funeral-home source.
            </p>
            <p>
              Then mark each fact as verified, needs confirmation, or memory only. This makes the final story warmer without hiding where the evidence ends.
            </p>
          </section>

          <section className="about-card stories-link-box" aria-labelledby="best-link">
            <div>
              <h2 id="best-link">Best Link Target For Obituary Research Pages</h2>
              <p>
                Use this page for genealogy resource lists, public-library research guides, obituary search directories, family-history newsletters, and local-history society pages. For drafting after research, use the <Link href="/how-to-write-an-obituary-story/">obituary story writing guide</Link> and <Link href="/obituary-story-worksheet/">obituary story worksheet</Link>. For finished source-backed examples, link to the <Link href="/obituary-stories/">obituary stories archive</Link>.
              </p>
            </div>
            <Link href="/obituary-research-guide/">{absoluteUrl("/obituary-research-guide/")}</Link>
          </section>

          <section className="explainer-next" aria-labelledby="reference-links">
            <div>
              <div className="kicker">Research references</div>
              <h2 id="reference-links">Helpful Obituary Research Resources</h2>
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

          <section className="explainer-next" aria-labelledby="story-examples">
            <div>
              <div className="kicker">After research</div>
              <h2 id="story-examples">Turn Records Into Obituary Stories</h2>
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
        Obituary research with source trails. <Link href="/press/">Press and review resources</Link>.
      </footer>
    </>
  );
}
