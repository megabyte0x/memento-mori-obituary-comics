import Link from "next/link";

import { FaqSection } from "@/components/faq-section";
import { ResourceLayout } from "@/components/resource-layout";
import { ResourceStoryBridge } from "@/components/resource-story-bridge";
import { comicPath, getComics, selectResearchGuideComics, sourceItems } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "An obituary research guide for genealogy, library, and family-history searches: where to look, what facts to verify, and how to turn an obituary record into a sourced life story.";

const faqs = [
  {
    question: "How do you research an obituary?",
    answer:
      "Start with the full name, an approximate death date, and a location. Search newspaper archives, funeral-home sites, and obituary databases, then confirm details against public records such as death indexes, cemetery listings, and census data. Note the publication, date, and URL for every record so the obituary can be cited and verified later.",
  },
  {
    question: "Where can you find old obituaries for free?",
    answer:
      "Free sources include public library newspaper archives, Chronicling America from the Library of Congress, FamilySearch, Find a Grave, and many local genealogical society indexes. Public libraries often provide free in-branch access to paid databases like NewspaperArchive or GenealogyBank, so a library card can unlock obituaries that are otherwise behind a paywall.",
  },
  {
    question: "How do you find an obituary when you only know a name?",
    answer:
      "Add any detail you have, such as an approximate age, city, or relative's name, to narrow results. Search obituary databases and newspaper archives by name plus location, then cross-check candidates against cemetery records and death indexes. Family trees on FamilySearch or Ancestry can confirm dates that point you to the correct obituary.",
  },
  {
    question: "How do you cite an obituary as a genealogy source?",
    answer:
      "Record the deceased's name, the publication or website, the publication date, and the URL or page and image number. Add the access date for online sources. A citation like \"Obituary, [Name], [Newspaper], [date], [URL], accessed [date]\" lets other researchers locate the same record and judge its reliability.",
  },
];

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

export default async function ObituaryResearchGuidePage() {
  const comics = await loadRuntimeComics();
  const { featured, latest, remaining } = selectResearchGuideComics(comics, "virginia-hall-limping-lady");
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
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/obituary-research-guide/#webpage` },
        keywords: ["obituary research", "genealogy", "family history", "obituary records", "life story writing"],
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
      <ResourceLayout
        currentPath="/obituary-research-guide/"
        kicker="Obituary research guide"
        title="Obituary Research Guide"
        description={description}
      >

          <section className="explainer-body" aria-labelledby="research-purpose">
            <h2 id="research-purpose">What Obituary Research Can Prove</h2>
            <p>
              Obituary research helps genealogists, librarians, and families move from a name and date to a fuller life record. A useful obituary can confirm relationships, places, occupations, service details, burial information, affiliations, and the words a community used to remember someone.
            </p>
            <p>
              It can also mislead if treated as a perfect record. Names may be misspelled, dates may be rounded, relatives may be omitted, and online indexes may classify unrelated articles as obituaries. Treat the obituary as a strong clue, then compare it with death certificates, cemetery records, census entries, directories, letters, photographs, and local newspapers.
            </p>
          </section>

          <ResourceStoryBridge featuredComic={featured} latestComic={latest} />

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

          <FaqSection
            heading="Obituary Research FAQ"
            path="/obituary-research-guide/"
            items={faqs}
          />

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
              {remaining.map((comic) => {
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
        </ResourceLayout>
    </>
  );
}
