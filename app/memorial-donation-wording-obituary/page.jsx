import Link from "next/link";

import { FaqSection } from "@/components/faq-section";
import { ResourceLayout } from "@/components/resource-layout";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, sourceItems } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "Practical memorial donation wording for an obituary: in lieu of flowers examples, charity details to verify, donation-link safety, family-support language, and thank-you tracking.";

const faqs = [
  {
    question: "How do you word memorial donations in an obituary?",
    answer:
      "A clear line names the charity and how to give: \"In lieu of flowers, the family requests that memorial donations be made to [charity name], [address or website].\" Add the program or fund if the gift is for a specific cause, and confirm the charity's exact legal name and donation page so readers reach the right organization.",
  },
  {
    question: "What is the proper wording for in lieu of flowers?",
    answer:
      "Common phrasings include \"In lieu of flowers, memorial contributions may be made to [charity],\" or the softer \"The family suggests donations to [charity] in [name]'s memory.\" Use \"in lieu of flowers\" when you want to redirect gifts entirely, or \"in addition to flowers\" if some floral tributes are still welcome.",
  },
  {
    question: "How do you ask for donations instead of flowers?",
    answer:
      "Phrase it as a gentle request rather than a demand: \"In lieu of flowers, please consider a gift to [charity].\" Name a cause connected to the person's life or illness so the request feels meaningful. Include the charity's website or mailing address, and note if donations can be made in the deceased's name.",
  },
  {
    question: "Can you suggest donations to more than one charity?",
    answer:
      "Yes. List two or three options so readers can choose: \"Memorial donations may be made to [charity one], [charity two], or a charity of the donor's choice.\" Keep the list short to avoid confusion, verify each organization's name and donation link, and consider naming a single cause if you want to concentrate the impact.",
  },
];

const wordingOptions = [
  {
    label: "Simple charity request",
    text: "In memory of [Name], memorial donations may be made to [Organization Name] at [official website or mailing address].",
    use: "Use this when the family has chosen one official charity or memorial-giving page.",
  },
  {
    label: "Gentler in-lieu wording",
    text: "If you wish to honor [Name]'s memory, please consider a gift to [Organization Name], a cause close to [his/her/their] heart.",
    use: "Use this when the phrase in lieu of flowers feels too blunt, but the family still wants to guide gifts toward a cause.",
  },
  {
    label: "Flowers or donations both welcome",
    text: "Flowers are welcome, or memorial gifts may be directed to [Organization Name] in [Name]'s memory.",
    use: "Use this when some relatives may want to send flowers and others may prefer a donation.",
  },
  {
    label: "Favorite charity option",
    text: "Those wishing to remember [Name] may make a donation to a charity meaningful to them, noting the gift in [Name]'s memory.",
    use: "Use this when the family does not want to name one organization or when the person's interests were broad.",
  },
  {
    label: "Scholarship or memorial fund",
    text: "Memorial contributions may be made to the [Fund Name], established to support [purpose]. Details are available at [official link].",
    use: "Use this only after the fund, school, community foundation, or fiscal sponsor is ready to receive gifts.",
  },
  {
    label: "Family support or funeral expenses",
    text: "For those who wish to help, contributions toward funeral and family expenses may be made through [official fundraiser or funeral-home link].",
    use: "Use this when support is going to the family rather than a registered charity, and say that clearly.",
  },
];

const detailChecks = [
  {
    title: "Use the official organization name",
    text: "Write the charity name exactly as the organization uses it. Avoid abbreviations that could point donors to the wrong nonprofit.",
  },
  {
    title: "Add one verified giving path",
    text: "Use the charity's official memorial-giving link, tribute page, phone number, or mailing address. If the link is long, use the funeral home or memorial page as the single source of truth.",
  },
  {
    title: "Say how to designate the gift",
    text: "Tell donors whether to write the person's name in an online memorial field, check memo line, card message, or tribute form.",
  },
  {
    title: "Check family notification",
    text: "Many charities can send a notice to the family without sharing the gift amount. Confirm what donor and family information is needed before publishing.",
  },
  {
    title: "Separate charity gifts from family help",
    text: "If money is going to funeral expenses, a spouse, children, or a household, do not describe it as a charity donation. Use plain family-support language.",
  },
  {
    title: "Keep records after publication",
    text: "Save the obituary text, donation link, charity contact, donor notices, and thank-you list so the family can acknowledge gifts later.",
  },
];

const mistakes = [
  "Do not publish an unverified donation link, shortened URL, or third-party fundraiser that the family has not approved.",
  "Do not name a charity before confirming it can receive memorial gifts in the person's name.",
  "Do not imply donations are mandatory; the wording should guide people, not pressure them.",
  "Do not mix up flowers, Mass cards, family-expense gifts, and charity donations in one unclear sentence.",
  "Do not list multiple organizations without checking spelling, addresses, and whether each link is official.",
  "Do not promise tax treatment in the obituary. Let the charity provide receipts and tax language.",
];

const referenceLinks = [
  {
    label: "Funeral Basics: in lieu of flowers and donations",
    href: "https://www.funeralbasics.org/in-lieu-of-flowers-and-donations/",
    note: "Explains what in lieu of flowers means in an obituary, how donors can give, and why family wishes should guide the response.",
  },
  {
    label: "Emily Post: donations in lieu of flowers",
    href: "https://emilypost.com/advice/funeral-etiquette-donations-in-lieu-of-flowers",
    note: "Etiquette guidance on donation notices, memorial notes, family acknowledgement, and when flowers may still be appropriate.",
  },
  {
    label: "American Cancer Society: memorial and honor giving",
    href: "https://www.cancer.org/donate/memorial-giving.html",
    note: "Example of a major charity memorial-giving page with tribute fundraisers, memorial gift envelopes, and family acknowledgement options.",
  },
  {
    label: "American Heart Association: honor and memorial gifts",
    href: "https://www.heart.org/en/honor-memorial",
    note: "Example of a nonprofit memorial-giving page that allows donations in memory of a loved one and family notification.",
  },
  {
    label: "Alzheimer's Association: memorial donations",
    href: "https://www.alz.org/manh/about/the-giving-spirit",
    note: "Example charity page with obituary verbiage, online donation instructions, and funeral-home director contact details.",
  },
  {
    label: "Funeral.com: memorial donations in lieu of flowers",
    href: "https://funeral.com/blogs/the-journal/memorial-donations-in-lieu-of-flowers-how-to-request-and-manage-gifts-in-someone-s-honor",
    note: "Family-facing guide on choosing a charity, wording donation requests, setting up memorial funds, and tracking thank-you notes.",
  },
];

export const metadata = {
  title: "Memorial Donation Wording for an Obituary",
  description,
  keywords: [
    "memorial donation wording obituary",
    "in lieu of flowers wording",
    "memorial donations in lieu of flowers",
    "obituary donation wording",
    "charity donation wording obituary",
    "memorial contribution wording",
  ],
  alternates: {
    canonical: "/memorial-donation-wording-obituary/",
  },
  openGraph: {
    type: "article",
    title: `Memorial Donation Wording for an Obituary | ${SITE_NAME}`,
    description,
    url: "/memorial-donation-wording-obituary/",
  },
  twitter: {
    title: `Memorial Donation Wording for an Obituary | ${SITE_NAME}`,
    description,
  },
};

export default async function MemorialDonationWordingObituaryPage() {
  const comics = await loadRuntimeComics();
  const latestDate = comics.reduce((max, comic) => (comic.published_at > max ? comic.published_at : max), "2026-06-05");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "Article",
        "@id": `${SITE_URL}/memorial-donation-wording-obituary/#article`,
        headline: "Memorial Donation Wording for an Obituary",
        name: "Memorial Donation Wording for an Obituary",
        url: absoluteUrl("/memorial-donation-wording-obituary/"),
        description,
        inLanguage: SITE_LANGUAGE,
        datePublished: "2026-06-05",
        dateModified: latestDate,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/memorial-donation-wording-obituary/#webpage` },
        about: ["memorial donation wording", "in lieu of flowers", "obituary donation request", "charity memorial gifts"],
        mainEntity: {
          "@type": "ItemList",
          name: "Memorial donation wording options for an obituary",
          itemListElement: wordingOptions.map((option, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: option.label,
            description: `${option.text} ${option.use}`,
          })),
        },
        citation: referenceLinks.map((reference) => reference.href),
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/memorial-donation-wording-obituary/#webpage`,
        name: "Memorial Donation Wording for an Obituary",
        url: absoluteUrl("/memorial-donation-wording-obituary/"),
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
        currentPath="/memorial-donation-wording-obituary/"
        kicker="Memorial donation wording"
        title="Memorial Donation Wording For An Obituary"
        description={description}
      >

          <section className="explainer-body" aria-labelledby="quick-answer">
            <h2 id="quick-answer">Quick Answer</h2>
            <p>
              The clearest memorial donation wording names the person, the organization, the official donation path, and how the gift should be designated. A simple version is: In memory of [Name], memorial donations may be made to [Organization Name] at [official website or mailing address].
            </p>
            <p>
              Before publishing, verify the charity name, donation link, mailing address, family-notification process, and whether the request is for a registered charity, memorial fund, scholarship, or family support. Those are different gift paths, and the obituary should make the difference clear.
            </p>
          </section>

          <section className="worksheet-grid" aria-labelledby="wording">
            <div>
              <div className="kicker">Wording examples</div>
              <h2 id="wording">Donation Language You Can Adapt</h2>
            </div>
            <div className="worksheet-fields">
              {wordingOptions.map((option) => (
                <section className="worksheet-box" key={option.label}>
                  <h3>{option.label}</h3>
                  <p>{option.text}</p>
                  <p><strong>Use when:</strong> {option.use}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="explainer-principles" aria-labelledby="details">
            <div>
              <div className="kicker">Before publishing</div>
              <h2 id="details">Details To Confirm First</h2>
            </div>
            <div className="stories-intent-list">
              {detailChecks.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="explainer-body" aria-labelledby="mistakes">
            <h2 id="mistakes">Avoid These Donation-Wording Mistakes</h2>
            <ul className="writing-guide-list">
              {mistakes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <FaqSection
            heading="Memorial Donation Wording FAQ"
            path="/memorial-donation-wording-obituary/"
            items={faqs}
          />

          <section className="explainer-next" aria-labelledby="references">
            <div>
              <div className="kicker">References</div>
              <h2 id="references">Sources And Related Memorial-Giving Guidance</h2>
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
              {comics.slice(0, 4).map((comic) => (
                <li key={comic.slug}>
                  <Link href={comicPath(comic)}>{comic.person}: {comic.title}</Link>
                  <p>{comic.dek}</p>
                  <span>{comic.published_at} - Sources: {sourceItems(comic).map((source) => source.name).join(", ")}</span>
                </li>
              ))}
            </ul>
          </section>
        </ResourceLayout>
    </>
  );
}
