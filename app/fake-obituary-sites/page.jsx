import Link from "next/link";

import { ResourceLayout } from "@/components/resource-layout";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, sourceItems } from "@/lib/comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "A practical checklist for spotting fake obituary sites, obituary piracy, copied death notices, fake donation links, and scam memorial pages before you share or click.";

const redFlags = [
  {
    label: "The page is not from a funeral home, newspaper, or known memorial platform",
    reason: "Fake obituary sites often use generic names, scraped details, and ad-heavy layouts. Start by looking for an official funeral-home page, local newspaper notice, or recognized obituary platform.",
    action: "Search the full name with the city, funeral home, and the words obituary or death notice.",
  },
  {
    label: "The details are vague, wrong, or copied from another notice",
    reason: "Obituary pirates may copy public death notices, summarize social posts, or fabricate missing facts. Errors in age, middle name, location, relatives, or cause of death are strong warning signs.",
    action: "Compare names, dates, locations, family names, and service details against the official notice before sharing.",
  },
  {
    label: "The page asks for gifts, flowers, donations, or livestream payments",
    reason: "Scam obituary pages may route money away from the family, funeral home, or chosen charity. Fake livestream links and memorial-product links can also be used to collect payment details.",
    action: "Donate only through a link confirmed by the family, funeral home, newspaper, or the named charity.",
  },
  {
    label: "The site pushes popups, CAPTCHA traps, or virus warnings",
    reason: "Some fake obituary networks use search traffic to push browser notifications, false security alerts, affiliate offers, or other unwanted redirects.",
    action: "Close the tab. Do not approve notifications, install anything, or keep clicking through ads.",
  },
  {
    label: "The obituary appeared before the family or funeral home published anything",
    reason: "Scammers and low-quality content farms may react to social media posts or news reports before an official obituary exists.",
    action: "Wait for the family, funeral home, or local newspaper to publish the verified version.",
  },
  {
    label: "There is no clear correction, takedown, or contact path",
    reason: "Legitimate publishers and funeral homes usually provide a way to correct a notice. Scraper sites often hide ownership and make removal difficult.",
    action: "Save screenshots and URLs, then report the page to the platform, host, registrar, consumer-protection office, or local police if fraud is involved.",
  },
];

const verificationSteps = [
  {
    title: "Find the official version first",
    text: "Use the funeral home's website, the local newspaper, Legacy.com or another recognized obituary platform, a church or cemetery notice, or a direct family post that points to an official page.",
  },
  {
    title: "Check the source before the story",
    text: "A real-looking obituary can still be copied. Check the domain, publication name, funeral-home license information where available, byline, contact details, and whether the page explains who handles donations or gifts.",
  },
  {
    title: "Verify money requests offline",
    text: "Before sending flowers, memorial gifts, livestream payments, or donations, call the funeral home or ask someone close to the family. Do not rely on the link embedded in a suspicious obituary.",
  },
  {
    title: "Avoid boosting the fake page",
    text: "Do not share, comment on, or repeatedly click a fake obituary. Share the official obituary instead, and ask friends to use the verified link.",
  },
  {
    title: "Document and report",
    text: "Save the URL, screenshot, publication time, ad or payment links, and the verified obituary. Use the platform report form, the domain host or registrar abuse path, and local consumer-protection reporting routes when money or impersonation is involved.",
  },
];

const quickChecklist = [
  "Search the person's full name with obituary, death notice, city, and funeral home.",
  "Prefer notices on a funeral-home website, local newspaper, or recognized memorial platform.",
  "Compare age, spelling, relatives, location, service details, and cause-of-death claims.",
  "Do not donate through a page until the family, funeral home, or charity confirms it.",
  "Do not approve browser notifications, CAPTCHA prompts, downloads, or virus-warning popups.",
  "Share the verified obituary link and ask friends not to link to the fake result.",
  "Save screenshots before reporting, because scam pages may change or disappear.",
];

const referenceLinks = [
  {
    label: "Michigan Attorney General: obituary pirates warning",
    href: "https://www.michigan.gov/ag/news/press-releases/2024/03/06/ag-nessel-warns-residents-to-beware-of-obituary-pirates-after-death-of-loved-one",
    note: "Consumer alert describing obituary pirates, fake donation risk, and verification steps for families.",
  },
  {
    label: "Consumer Protection BC: obituary scams news release",
    href: "https://www.consumerprotectionbc.ca/news/consumer-protection-bc-warns-consumers-about-obituary-scams/",
    note: "Funeral-sector regulator warning about copied obituaries, donation requests, licensing checks, and fraud reporting.",
  },
  {
    label: "Bereavement Authority of Ontario: online obituary piracy notice",
    href: "https://thebao.ca/notice-to-the-consumer-beware-of-online-obituary-piracy/",
    note: "Consumer notice advising readers to verify funeral homes, newspapers, and online obituary donation links.",
  },
  {
    label: "Funeralwise: fake obituaries",
    href: "https://www.funeralwise.com/fake-obituaries-a-troubling-trend/",
    note: "Family-facing guide to suspicious sources, inconsistent details, unverified fundraising, and fake obituary warning signs.",
  },
  {
    label: "Sophos Counter Threat Unit: AI and fake obituary sites",
    href: "https://www.sophos.com/en-us/blog/are-scammers-using-ai-to-enhance-fake-obituary-sites",
    note: "Security research on fake obituary domains, AI-generated notices, popups, redirects, and SEO abuse.",
  },
  {
    label: "WKYT Investigates: fake obituaries",
    href: "https://www.wkyt.com/2025/07/07/wkyt-investigates-fake-obituaries/",
    note: "Local-news investigation with practical steps for monitoring, documentation, reporting, and sharing only the correct notice.",
  },
];

export const metadata = {
  title: "Fake Obituary Sites: How to Spot Obituary Piracy",
  description,
  keywords: [
    "fake obituary sites",
    "fake obituaries",
    "obituary piracy",
    "obituary scam",
    "how to tell if an obituary is real",
    "obituary fraud",
  ],
  alternates: {
    canonical: "/fake-obituary-sites/",
  },
  openGraph: {
    type: "article",
    title: `Fake Obituary Sites | ${SITE_NAME}`,
    description,
    url: "/fake-obituary-sites/",
  },
  twitter: {
    title: `Fake Obituary Sites | ${SITE_NAME}`,
    description,
  },
};

export default function FakeObituarySitesPage() {
  const comics = getComics();
  const latestDate = comics.reduce((max, comic) => (comic.published_at > max ? comic.published_at : max), "2026-06-05");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "Article",
        "@id": `${SITE_URL}/fake-obituary-sites/#article`,
        headline: "Fake Obituary Sites: How to Spot Obituary Piracy",
        name: "Fake Obituary Sites: How to Spot Obituary Piracy",
        url: absoluteUrl("/fake-obituary-sites/"),
        description,
        inLanguage: SITE_LANGUAGE,
        datePublished: "2026-06-05",
        dateModified: latestDate,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/fake-obituary-sites/#webpage` },
        about: ["fake obituary sites", "obituary piracy", "obituary scams", "obituary fraud"],
        mainEntity: {
          "@type": "ItemList",
          name: "Fake obituary site warning signs",
          itemListElement: redFlags.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            description: `${item.reason} What to do: ${item.action}`,
          })),
        },
        citation: referenceLinks.map((reference) => reference.href),
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/fake-obituary-sites/#webpage`,
        name: "Fake Obituary Sites: How to Spot Obituary Piracy",
        url: absoluteUrl("/fake-obituary-sites/"),
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
        currentPath="/fake-obituary-sites/"
        kicker="Obituary scam checklist"
        title="Fake Obituary Sites"
        description={description}
      >

          <section className="explainer-body" aria-labelledby="quick-answer">
            <h2 id="quick-answer">Quick Answer</h2>
            <p>
              A fake obituary site is a page that copies, fabricates, or exaggerates a death notice so it can earn ad clicks, collect money, push fake livestreams, sell memorial products, or redirect readers to suspicious offers. Obituary piracy usually starts with a real name and a real loss, which makes the page feel believable even when the details are wrong.
            </p>
            <p>
              Before sharing or donating, verify the notice through a funeral home, local newspaper, recognized memorial platform, cemetery, church, or trusted family source. If the page asks for money, pushes popups, or gets basic facts wrong, treat it as suspicious until an official source confirms it.
            </p>
          </section>

          <section className="worksheet-grid" aria-labelledby="red-flags">
            <div>
              <div className="kicker">Red flags</div>
              <h2 id="red-flags">How To Spot A Fake Obituary Site</h2>
            </div>
            <div className="worksheet-fields">
              {redFlags.map((item) => (
                <section className="worksheet-box" key={item.label}>
                  <h3>{item.label}</h3>
                  <p>{item.reason}</p>
                  <p><strong>What to do:</strong> {item.action}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="explainer-principles" aria-labelledby="verification">
            <div>
              <div className="kicker">Verification steps</div>
              <h2 id="verification">Check The Obituary Before You Share It</h2>
            </div>
            <div className="stories-intent-list">
              {verificationSteps.map((step) => (
                <article key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="explainer-body" aria-labelledby="quick-checklist">
            <h2 id="quick-checklist">One-Minute Checklist</h2>
            <ul className="writing-guide-list">
              {quickChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
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
        </ResourceLayout>
    </>
  );
}
