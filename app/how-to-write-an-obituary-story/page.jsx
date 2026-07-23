import Link from "next/link";

import { FaqSection } from "@/components/faq-section";
import { ResourceLayout } from "@/components/resource-layout";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, getLatestComic, sourceItems } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const faqs = [
  {
    question: "How do you start an obituary?",
    answer:
      "Start with the essential facts in the first sentence: the full name, age, city, and the date of death. A common opening is \"[Full name], [age], of [city], died on [date].\" Once the factual line is set, the next paragraph can open the life story with the place, family, or defining work that the rest of the obituary will explain.",
  },
  {
    question: "What should an obituary include?",
    answer:
      "A complete obituary usually includes the full name (and nickname or maiden name), age, dates and places of birth and death, surviving and predeceased family members, education and work history, military or community service, hobbies and accomplishments, service or memorial details, and any donation or charity preferences. The strongest obituaries also include one specific scene or detail that shows who the person actually was.",
  },
  {
    question: "How long should an obituary be?",
    answer:
      "Most newspaper obituaries run 200 to 500 words because papers charge by the line or word. Funeral-home and online memorial pages have no length limit, so a fuller life story of 500 to 1,000 words is common there. A practical approach is to write a short, accurate notice for paid print and a longer narrative obituary story for the free online version.",
  },
  {
    question: "How do you write an obituary that does not sound generic?",
    answer:
      "Replace broad praise with one or two specific scenes. Instead of \"she loved her family,\" name what she actually did: the Sunday phone calls, the garden she rebuilt, the recipe everyone still makes. Choose a single life-shaping moment as the spine of the story, confirm the facts around it, and let concrete detail carry the meaning rather than adjectives.",
  },
  {
    question: "Who writes the obituary?",
    answer:
      "An obituary is usually written by a close family member, sometimes with help from the funeral home, or by a friend the family asks. A paid death notice can be submitted by anyone the newspaper accepts as next of kin or an authorized representative, and most newspapers require the funeral home or family to verify the death before publication.",
  },
];

const description =
  "A practical guide to writing an obituary story: gather evidence, choose the life-shaping moment, avoid generic praise, and turn a death notice into a sourced life story.";

const writingSteps = [
  {
    title: "Begin with the record",
    text: "Collect the full name, dates, places, family details, service information, work history, education, military service, and the publication rules before writing the first sentence.",
  },
  {
    title: "Choose the life-shaping moment",
    text: "A stronger obituary story usually turns on one pressure point: a move, illness, loss, invention, act of care, public work, private habit, or decision that reveals the person.",
  },
  {
    title: "Build a scene bank",
    text: "Ask for two or three specific scenes rather than broad praise. Good prompts include what the person kept doing under stress, what room they changed by entering, and what detail family members still quote.",
  },
  {
    title: "Separate evidence from tribute",
    text: "Affection belongs in an obituary, but factual claims still need care. Confirm dates, names, awards, spellings, and causes or circumstances before turning them into a polished line.",
  },
  {
    title: "Write for readers who did not know them",
    text: "A useful obituary story gives strangers enough context to understand why the person mattered while still sounding recognizable to family, friends, classmates, colleagues, and neighbors.",
  },
  {
    title: "Revise for dignity and privacy",
    text: "Remove medical details, conflict, addresses, or family facts that do not serve the public story. When in doubt, ask whether the detail helps memory or only satisfies curiosity.",
  },
];

const promptGroups = [
  {
    title: "Evidence prompts",
    items: [
      "What dates, names, places, and titles must be correct?",
      "Which details can be verified in records, articles, letters, photographs, or family documents?",
      "Which claims should be softened because they are memory, not documentation?",
    ],
  },
  {
    title: "Story prompts",
    items: [
      "What did this person keep doing when life became difficult?",
      "Which moment shows their character better than a list of adjectives?",
      "What did they make, repair, protect, teach, rescue, or pass on?",
    ],
  },
  {
    title: "Image prompts",
    items: [
      "Which photograph, object, room, uniform, tool, recipe, note, route, or place carries the story?",
      "What image would make the obituary feel specific without exposing private grief?",
      "Could one visual detail replace a paragraph of generic praise?",
    ],
  },
];

const storyFrame = [
  "Death notice: state the essential facts plainly and accurately.",
  "Life context: give the reader the family, place, work, faith, service, school, or community frame.",
  "Defining scene: choose one remembered moment that shows character in action.",
  "Legacy: name what remains in people, places, work, habits, stories, or records.",
  "Practical details: include services, memorial instructions, donation preferences, or a publication note when appropriate.",
];

export const metadata = {
  title: "How to Write an Obituary Story",
  description,
  keywords: [
    "how to write an obituary story",
    "obituary story",
    "obituary writing prompts",
    "life story obituary",
    "obituary articles",
    "visual obituary stories",
    "turn obituary into story",
  ],
  alternates: {
    canonical: "/how-to-write-an-obituary-story/",
  },
  openGraph: {
    type: "article",
    title: `How to Write an Obituary Story | ${SITE_NAME}`,
    description,
    url: "/how-to-write-an-obituary-story/",
  },
  twitter: {
    title: `How to Write an Obituary Story | ${SITE_NAME}`,
    description,
  },
};

export default async function HowToWriteObituaryStoryPage() {
  const comics = await loadRuntimeComics();
  const latest = getLatestComic(comics);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "Article",
        "@id": `${SITE_URL}/how-to-write-an-obituary-story/#article`,
        headline: "How to Write an Obituary Story",
        name: "How to Write an Obituary Story",
        url: absoluteUrl("/how-to-write-an-obituary-story/"),
        description,
        inLanguage: SITE_LANGUAGE,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/how-to-write-an-obituary-story/#webpage` },
        keywords: ["obituary story", "obituary writing", "life story obituary", "visual obituaries"],
        mainEntity: {
          "@type": "ItemList",
          name: "Obituary story writing steps",
          itemListElement: writingSteps.map((step, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: step.title,
            description: step.text,
          })),
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/how-to-write-an-obituary-story/#webpage`,
        name: "How to Write an Obituary Story",
        url: absoluteUrl("/how-to-write-an-obituary-story/"),
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
        currentPath="/how-to-write-an-obituary-story/"
        kicker="Obituary writing guide"
        title="How to Write an Obituary Story"
        description={description}
      >

          <section className="explainer-body" aria-labelledby="obituary-story-definition">
            <h2 id="obituary-story-definition">What Makes It A Story</h2>
            <p>
              An obituary story is not just a longer death notice. A death notice tells people that someone died and where services will happen. An obituary story also gives readers a shaped account of the life: the facts, the setting, the pressure point, and the detail that makes the person memorable.
            </p>
            <p>
              The goal is not to make grief decorative. The goal is to preserve a life with enough accuracy that family can recognize it, strangers can understand it, and future readers can cite it without guessing what is true.
            </p>
          </section>

          <section className="explainer-principles" aria-labelledby="writing-steps">
            <div>
              <div className="kicker">Process</div>
              <h2 id="writing-steps">Six Steps For A Better Obituary Story</h2>
            </div>
            <div className="stories-intent-list">
              {writingSteps.map((step) => (
                <article key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="explainer-body" aria-labelledby="story-frame">
            <h2 id="story-frame">A Simple Obituary Story Frame</h2>
            <p>
              Use this frame when the page, newspaper, funeral home, or memorial site allows enough room for a narrative. If you need a printable planning page, use the <Link href="/obituary-story-worksheet/">obituary story worksheet</Link> before drafting. Keep the order if you need clarity; rearrange it if the defining scene deserves to come first.
            </p>
            <ol className="writing-guide-list">
              {storyFrame.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="stories-intent-grid writing-guide-prompts" aria-labelledby="writing-prompts">
            <div className="stories-intro">
              <div className="kicker">Interview prompts</div>
              <h2 id="writing-prompts">Questions That Produce Specific Details</h2>
              <p>
                The best material usually comes from precise questions. Ask for scenes, objects, sayings, routines, places, and records before asking for adjectives.
              </p>
            </div>
            <div className="stories-intent-list">
              {promptGroups.map((group) => (
                <article key={group.title}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          

          <FaqSection
            heading="Obituary Writing FAQ"
            path="/how-to-write-an-obituary-story/"
            items={faqs}
          />

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
