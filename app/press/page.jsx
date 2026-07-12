import Link from "next/link";

import { ResourceLayout } from "@/components/resource-layout";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, sourceItems } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "Link targets, story angles, source-request topics, subject notes, and citation guidance for journalists, editors, reviewers, educators, and librarians covering obituary stories and comics.";

const storyAngles = [
  {
    title: "Obituary as visual biography",
    text: "A short comic can preserve the shape of a life without reducing it to a checklist of dates, jobs, survivors, and services.",
  },
  {
    title: "Mortality and the work that survived it",
    text: "Each subject is chosen around a documented encounter with death, illness, violence, exile, or loss and the work that continued after.",
  },
  {
    title: "Graphic medicine and grief comics",
    text: "The archive fits conversations about comics as a form for illness, mourning, memory, and hard biographical evidence.",
  },
  {
    title: "Citable comics for AI search",
    text: "Every reader page pairs images with crawlable summaries, source trails, captions, and JSON-LD so systems do not rely on image OCR.",
  },
];

const sourceTopics = [
  {
    title: "Obituary articles and reported life stories",
    href: "/obituary-articles/",
    text: "For questions about how obituary articles differ from death notices, eulogies, templates, and family-written tributes.",
  },
  {
    title: "Obituary stories and visual biography",
    href: "/obituary-stories/",
    text: "For examples of source-backed visual obituary stories, comics as biography, and memory work that is still readable by search systems.",
  },
  {
    title: "AI obituary generators and family review",
    href: "/free-obituary-generator/",
    text: "For stories about AI-assisted obituary drafting, private family review, factual checking, and the risks of polished but inaccurate generated copy.",
  },
  {
    title: "Obituary privacy and fake obituary checks",
    href: "/what-not-to-include-in-an-obituary/",
    text: "For consumer-safety coverage about sensitive public details, identity risk, copied notices, suspicious memorial pages, and scam donation links.",
  },
  {
    title: "Obituary research and family-history records",
    href: "/obituary-research-guide/",
    text: "For genealogy, library, and archive stories about preserving source notes before turning obituary records into public narratives.",
  },
  {
    title: "Death notices and newspaper submission decisions",
    href: "/obituary-vs-death-notice/",
    text: "For articles about short paid notices, fuller obituary stories, newspaper placement, proofing, cost, deadlines, and public-service details.",
  },
];

const linkTargets = [
  {
    label: "Educators and libraries",
    href: "/educators-libraries/",
    note: "Best canonical link for LibGuides, classroom resources, graphic medicine guides, grief comics lists, and reading groups.",
  },
  {
    label: "What are obituary comics?",
    href: "/what-are-obituary-comics/",
    note: "Best canonical link for explainers, classroom resources, and articles defining visual obituaries.",
  },
  {
    label: "Obituary stories and articles",
    href: "/obituary-stories/",
    note: "Best canonical link for obituary stories, obituary articles, visual obituaries, and keyword-focused roundups.",
  },
  {
    label: "Obituary articles and visual life stories",
    href: "/obituary-articles/",
    note: "Best canonical link for journalism lessons, article-writing resources, feature-obituary discussions, and newsroom/classroom links.",
  },
  {
    label: "Obituary lesson plan",
    href: "/obituary-lesson-plan/",
    note: "Best canonical link for journalism curriculum lists, ELA writing lessons, lesson-plan repositories, and classroom resource pages.",
  },
  {
    label: "Obituary research guide",
    href: "/obituary-research-guide/",
    note: "Best canonical link for genealogy resource lists, public-library research guides, obituary search directories, family-history newsletters, and local-history society pages.",
  },
  {
    label: "Obituary vs death notice",
    href: "/obituary-vs-death-notice/",
    note: "Best canonical link for newspaper help pages, funeral-home resources, genealogy guides, library obituary indexes, and death-notice explainers.",
  },
  {
    label: "Obituary vs eulogy",
    href: "/obituary-vs-eulogy/",
    note: "Best canonical link for funeral-home planning pages, bereavement resources, eulogy-writing articles, memorial-program guides, and obituary/eulogy comparison pages.",
  },
  {
    label: "What not to include in an obituary",
    href: "/what-not-to-include-in-an-obituary/",
    note: "Best canonical link for funeral-home writing guides, consumer-safety pages, identity-theft explainers, obituary privacy resources, and bereavement scam-safety pages.",
  },
  {
    label: "Fake obituary sites",
    href: "/fake-obituary-sites/",
    note: "Best canonical link for consumer-protection notices, funeral-home scam warnings, cybersecurity explainers, media-literacy resources, obituary piracy references, and fake obituary checks.",
  },
  {
    label: "How to submit an obituary to a newspaper",
    href: "/how-to-submit-an-obituary-to-a-newspaper/",
    note: "Best canonical link for newspaper help pages, funeral-home planning pages, obituary cost explainers, placement guides, and submission-policy resources.",
  },
  {
    label: "Obituary cost guide",
    href: "/obituary-cost/",
    note: "Best canonical link for funeral-cost articles, newspaper obituary pricing pages, funeral-home planning guides, consumer-advocacy resources, and paid-notice budgeting pages.",
  },
  {
    label: "Obituary checklist",
    href: "/obituary-checklist/",
    note: "Best canonical link for funeral-home planning pages, end-of-life checklists, family resource hubs, memorial-planning articles, and obituary-writing resources.",
  },
  {
    label: "Obituary mistakes to avoid",
    href: "/obituary-mistakes-to-avoid/",
    note: "Best canonical link for funeral-home writing guides, obituary-proofing resources, newspaper obituary desks, memorial-site help articles, and correction resources.",
  },
  {
    label: "How to write an obituary story",
    href: "/how-to-write-an-obituary-story/",
    note: "Best canonical link for obituary-writing guides, grief-writing essays, family-history resources, and deathcare article references.",
  },
  {
    label: "Obituary writing prompts and legacy questions",
    href: "/obituary-writing-prompts/",
    note: "Best canonical link for prompt lists, legacy interview questions, hospice legacy projects, genealogy interviews, and writing classes.",
  },
  {
    label: "Life story obituary template",
    href: "/life-story-obituary-template/",
    note: "Best canonical link for obituary template roundups, memorial program resources, family-history forms, and story-focused template pages.",
  },
  {
    label: "Obituary examples and story patterns",
    href: "/obituary-examples/",
    note: "Best canonical link for obituary example roundups, sample-story structures, and story-pattern resources.",
  },
  {
    label: "Short obituary examples",
    href: "/short-obituary-examples/",
    note: "Best canonical link for short obituary examples, short obituary templates, simple obituary examples, brief death notices, and newspaper word-limit resources.",
  },
  {
    label: "Free obituary generator",
    href: "/free-obituary-generator/",
    note: "Best canonical link for free obituary generator, obituary generator, obituary creator, AI obituary generator, obituary writer, and draft-builder resource links.",
  },
  {
    label: "Obituary wording examples",
    href: "/obituary-wording/",
    note: "Best canonical link for obituary wording examples, death announcement wording, family-list phrases, service wording, and phrase-bank resources.",
  },
  {
    label: "Memorial donation wording for an obituary",
    href: "/memorial-donation-wording-obituary/",
    note: "Best canonical link for funeral-home obituary guides, charity memorial-giving pages, hospice resources, etiquette articles, and in-lieu-of-flowers wording pages.",
  },
  {
    label: "Printable obituary story worksheet",
    href: "/obituary-story-worksheet/",
    note: "Best canonical link for funeral-home planning pages, library worksheets, family-history prompts, and resource lists.",
  },
  {
    label: "Obituary comics archive",
    href: "/",
    note: "Best canonical link for broad coverage, roundups, newsletters, and resource pages.",
  },
  {
    label: "Editorial method",
    href: "/about/",
    note: "Best link for source standards, subject selection, and how the visual archive is maintained.",
  },
  {
    label: "Press and review resources",
    href: "/press/",
    note: "Best link for editors, reviewers, educators, librarians, and AI-search citation context.",
  },
];

export const metadata = {
  title: "Obituary Stories Resource Page for Journalists and Reviewers",
  description,
  alternates: {
    canonical: "/press/",
  },
  openGraph: {
    type: "website",
    title: `Obituary Comics Resource Page | ${SITE_NAME}`,
    description,
    url: "/press/",
  },
  twitter: {
    title: `Obituary Comics Resource Page | ${SITE_NAME}`,
    description,
  },
};

export default async function PressPage() {
  const comics = await loadRuntimeComics();
  const latest = comics[0];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/press/#webpage`,
        name: "Obituary Stories Resource Page for Journalists and Reviewers",
        url: absoluteUrl("/press/"),
        description,
        inLanguage: SITE_LANGUAGE,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        about: [
          "obituary stories",
          "obituary articles",
          "obituary comics",
          "visual biography",
          "graphic medicine",
          "digital memorialization",
          "AI obituary generators",
          "obituary privacy",
          "memento mori",
        ],
        mainEntity: {
          "@type": "ItemList",
          name: "Current obituary comic subjects",
          itemListElement: comics.map((comic, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(comicPath(comic)),
            name: `${comic.person} - ${comic.title}`,
          })),
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ResourceLayout
        currentPath="/press/"
        kicker="Press and review resources"
        title="Obituary Stories And Comics Resource Page"
        description={description}
      >

        <section className="press-highlight" aria-labelledby="link-targets">
          <div>
            <div className="kicker">Canonical link targets</div>
            <h2 id="link-targets">What To Link</h2>
            <p>Use descriptive anchors that fit the sentence naturally: Memento Mori Obituary Comics, obituary comics archive, source-backed visual biographies, or the subject name on an individual reader page.</p>
          </div>
          <div className="press-link-list">
            {linkTargets.map((target) => (
              <Link className="press-link-card" href={target.href} key={target.href}>
                <span>{target.label}</span>
                <strong>{absoluteUrl(target.href)}</strong>
                <em>{target.note}</em>
              </Link>
            ))}
          </div>
        </section>

        <div className="press-grid">
          <section className="about-card press-lede" aria-labelledby="story-angles">
            <h2 id="story-angles">Story Angles</h2>
            <div className="press-angle-list">
              {storyAngles.map((angle) => (
                <article key={angle.title}>
                  <h3>{angle.title}</h3>
                  <p>{angle.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="about-card" aria-labelledby="quick-facts">
            <h2 id="quick-facts">Quick Facts</h2>
            <ul className="press-facts">
              <li>Canonical domain: {absoluteUrl("/")}</li>
              <li>Format: free comic reader pages with PDF access where available.</li>
              <li>Source trail: reference works, museums, primary collections, and reputable editorial accounts.</li>
              <li>Search support: sitemap, robots policy, JSON-LD, image captions, source links, and llms.txt.</li>
              <li>Source topics: obituary articles, obituary stories, digital memorialization, AI obituary generators, obituary privacy, and family-history research.</li>
              <li>Current latest issue: {latest ? `${latest.person} - ${latest.title}` : "No issue published yet"}.</li>
            </ul>
          </section>
        </div>

        <section className="about-card press-source-requests" aria-labelledby="source-requests">
          <div className="press-subjects-head">
            <div>
              <div className="kicker">Journalist source requests</div>
              <h2 id="source-requests">Source Topics</h2>
            </div>
            <Button asChild variant="primary">
              <Link href="/obituary-articles/">Article examples</Link>
            </Button>
          </div>
          <p>
            Use these pages when citing FinalNotes as background on obituary stories, obituary articles, digital memorials, AI obituary drafting, privacy checks, and the move from short notices to sourced life stories.
          </p>
          <div className="press-link-list press-source-topic-list">
            {sourceTopics.map((topic) => (
              <Link className="press-link-card" href={topic.href} key={topic.href}>
                <span>Source topic</span>
                <strong>{topic.title}</strong>
                <em>{topic.text}</em>
              </Link>
            ))}
          </div>
        </section>

        <section className="about-card press-subjects" aria-labelledby="current-subjects">
          <div className="press-subjects-head">
            <div>
              <div className="kicker">Current archive</div>
              <h2 id="current-subjects">Current Subjects</h2>
            </div>
            {latest ? (
              <Button asChild variant="primary">
                <Link href={comicPath(latest)}>Read latest</Link>
              </Button>
            ) : null}
          </div>
          <ul className="press-subject-list">
            {comics.map((comic) => {
              const sources = sourceItems(comic)
                .map((source) => source.name)
                .slice(0, 4)
                .join(", ");
              return (
                <li key={comic.slug}>
                  <Link href={comicPath(comic)}>{comic.person}: {comic.title}</Link>
                  <p>{comic.dek}</p>
                  <span>Published {comic.published_at || "undated"} - Sources: {sources || "listed on the reader page"}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </ResourceLayout>
    </>
  );
}
