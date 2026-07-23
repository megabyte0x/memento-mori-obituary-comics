import Link from "next/link";

import { FaqSection } from "@/components/faq-section";
import { ResourceLayout } from "@/components/resource-layout";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, sourceItems } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "Obituary writing prompts and legacy interview questions for gathering facts, scenes, memories, records, and privacy notes before writing a life story.";

const faqs = [
  {
    question: "What are good obituary writing prompts?",
    answer:
      "Strong prompts ask for specific scenes rather than adjectives: What did this person keep doing when life got hard? What room changed when they walked in? What object, recipe, route, or phrase do people still quote? What did they make, repair, protect, or teach? Concrete answers give an obituary the detail that makes a life recognizable.",
  },
  {
    question: "What questions should you ask when writing an obituary?",
    answer:
      "Ask for the verified facts first: full name, dates, places, family, education, work, and service. Then ask story questions, such as the person's defining moment, a habit family members remember, and what they were proud of. Finish with privacy questions about which details should stay out of a public obituary.",
  },
  {
    question: "How do you write an obituary for someone you did not know well?",
    answer:
      "Interview the people who knew them and gather documents: photos, letters, records, and prior notices. Use prompts to collect two or three concrete scenes, then confirm names, dates, and spellings against records. Build the obituary around one verified, defining detail so the writing stays accurate and specific even without your own memories.",
  },
];

const promptGroups = [
  {
    title: "Facts before feelings",
    questions: [
      "Which full name, preferred name, date, place, and family details must be correct?",
      "Which funeral, memorial, donation, or publication details need exact wording?",
      "Which names, relationships, awards, jobs, schools, or service records still need confirmation?",
      "Which facts should be left out because they are private, unresolved, or unsafe to publish?",
    ],
  },
  {
    title: "Life chapters",
    questions: [
      "What place shaped this person before most people knew them?",
      "Which move, job, illness, loss, risk, or decision changed the direction of the life?",
      "What did they keep doing even when life became difficult?",
      "Which chapter would surprise a reader who only knew them near the end?",
    ],
  },
  {
    title: "People and care",
    questions: [
      "Who did this person protect, teach, feed, repair things for, listen to, or encourage?",
      "Which friendship, marriage, sibling bond, mentorship, or community tie shows their character?",
      "What did people reliably ask this person for help with?",
      "What would family members immediately recognize as something only they would do?",
    ],
  },
  {
    title: "Work and service",
    questions: [
      "What work, craft, public service, military service, caregiving, or volunteer role mattered most?",
      "Which achievement is specific enough to verify without exaggeration?",
      "What routine, tool, uniform, route, desk, room, or workplace detail makes the work visible?",
      "What did this person make easier, safer, warmer, smarter, or more possible for others?",
    ],
  },
  {
    title: "Objects and places",
    questions: [
      "Which photograph, recipe, notebook, car, instrument, coat, medal, book, or tool carries a memory?",
      "Which room, porch, road, kitchen, garden, church, classroom, studio, or field belongs in the story?",
      "What sound, smell, phrase, or repeated gesture would make the obituary feel specific?",
      "What object should be drawn, photographed, saved, or described for future readers?",
    ],
  },
  {
    title: "Hard seasons",
    questions: [
      "What challenge did this person face that can be named with dignity?",
      "Which details about illness, addiction, estrangement, violence, money, or family conflict need consent?",
      "What helped them endure: faith, humor, discipline, work, care, anger, art, routine, or other people?",
      "How can the obituary tell the truth without turning pain into spectacle?",
    ],
  },
  {
    title: "Legacy and ending",
    questions: [
      "What remains because this person lived: people, work, records, habits, places, lessons, or stories?",
      "Which sentence would a future grandchild, student, neighbor, reader, or researcher need most?",
      "What should mourners do with memory after the service is over?",
      "What is the cleanest final line that names the person without using generic praise?",
    ],
  },
  {
    title: "Visual obituary prompts",
    questions: [
      "Which verified fact should appear first so the story has an accurate anchor?",
      "Which pressure point should become the main panel, scene, or section?",
      "Which image can carry a memory without revealing private grief?",
      "Which source should be cited so readers know where the fact came from?",
    ],
  },
];

const draftPaths = [
  {
    title: "For a short obituary",
    text: "Use the facts-before-feelings prompts, choose one life chapter, add one object or relationship detail, then close with service or memorial information.",
  },
  {
    title: "For a family-history obituary",
    text: "Start with records, places, and dates. Add the chapter that explains how the person moved through a family, town, migration, career, or hardship.",
  },
  {
    title: "For a visual obituary",
    text: "Choose one verified fact, one defining scene, one remembered object, and one legacy sentence before deciding what should be drawn or captioned.",
  },
];

const referenceLinks = [
  {
    label: "StoryCorps Great Questions",
    href: "https://archive.storycorps.org/great-questions-list/",
    note: "Broad interview questions for family, illness, work, faith, heritage, and remembering loved ones.",
  },
  {
    label: "AARP legacy guide",
    href: "https://www.aarp.org/family-relationships/ways-to-preserve-your-legacy/",
    note: "Legacy preservation ideas across writing, scrapbooks, recordings, and family story projects.",
  },
  {
    label: "Horan & McConaty obituary tips",
    href: "https://www.horancares.com/funeral-services/helpful-tips-for-writing-an-obituary",
    note: "Funeral-home guidance that emphasizes story, personality, shared memories, and research.",
  },
  {
    label: "Cooperative Memorial Society obituary guide",
    href: "https://www.coopmemorial.org/forms-and-resources.html",
    note: "Planning resource with obituary submission guidance, privacy reminders, and draft prompts.",
  },
  {
    label: "LifeEcho legacy interview questions",
    href: "https://lifeecho.org/blog/what-are-good-questions-for-legacy-interview",
    note: "Legacy interview examples organized around concrete physical memories and life dimensions.",
  },
  {
    label: "Hospice Waterloo legacy activities",
    href: "https://www.hospicewaterloo.ca/legacy-activities/",
    note: "Hospice-oriented legacy activity ideas for families facing advanced illness.",
  },
];

export const metadata = {
  title: "Obituary Writing Prompts and Legacy Questions",
  description,
  keywords: [
    "obituary writing prompts",
    "obituary questions",
    "legacy interview questions",
    "life story questions obituary",
    "questions for writing an obituary",
    "obituary interview prompts",
    "visual obituary prompts",
  ],
  alternates: {
    canonical: "/obituary-writing-prompts/",
  },
  openGraph: {
    type: "article",
    title: `Obituary Writing Prompts and Legacy Questions | ${SITE_NAME}`,
    description,
    url: "/obituary-writing-prompts/",
  },
  twitter: {
    title: `Obituary Writing Prompts and Legacy Questions | ${SITE_NAME}`,
    description,
  },
};

export default async function ObituaryWritingPromptsPage() {
  const comics = await loadRuntimeComics();
  const featured = comics.slice(0, 4);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "Article",
        "@id": `${SITE_URL}/obituary-writing-prompts/#article`,
        headline: "Obituary Writing Prompts and Legacy Questions",
        name: "Obituary Writing Prompts and Legacy Questions",
        url: absoluteUrl("/obituary-writing-prompts/"),
        description,
        inLanguage: SITE_LANGUAGE,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/obituary-writing-prompts/#webpage` },
        keywords: ["obituary writing prompts", "legacy interview questions", "life story writing", "visual obituaries"],
        mainEntity: {
          "@type": "ItemList",
          name: "Obituary writing prompt groups",
          itemListElement: promptGroups.map((group, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: group.title,
            description: group.questions.join("; "),
          })),
        },
        citation: referenceLinks.map((reference) => reference.href),
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/obituary-writing-prompts/#webpage`,
        name: "Obituary Writing Prompts and Legacy Questions",
        url: absoluteUrl("/obituary-writing-prompts/"),
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
        currentPath="/obituary-writing-prompts/"
        kicker="Obituary writing prompts"
        title="Obituary Writing Prompts"
        description={description}
      >

          <section className="explainer-body" aria-labelledby="how-to-use-prompts">
            <h2 id="how-to-use-prompts">How To Use These Prompts</h2>
            <p>
              Obituary prompts work best when they collect specific evidence before asking for polished language. Start with names, dates, places, and publication requirements. Then ask for scenes, objects, work, care, and relationships that show the person in motion.
            </p>
            <p>
              You do not need every question. Choose one prompt from each useful group, write rough notes, verify the public facts, and move private or uncertain details into a family-only document.
            </p>
          </section>

          <section className="worksheet-grid" aria-labelledby="prompt-list">
            <div>
              <div className="kicker">Question bank</div>
              <h2 id="prompt-list">Questions For A Better Obituary</h2>
            </div>
            <div className="worksheet-fields">
              {promptGroups.map((group) => (
                <section className="worksheet-box" key={group.title}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>

          <section className="explainer-principles" aria-labelledby="draft-paths">
            <div>
              <div className="kicker">Draft paths</div>
              <h2 id="draft-paths">Turn Prompts Into A Draft</h2>
            </div>
            <div className="stories-intent-list">
              {draftPaths.map((path) => (
                <article key={path.title}>
                  <h3>{path.title}</h3>
                  <p>{path.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="explainer-body" aria-labelledby="source-backed-prompts">
            <h2 id="source-backed-prompts">Source-Backed Prompt Examples</h2>
            <p>
              The reader pages below show how prompts become usable story material: a verified fact, a life-shaping pressure point, a visual detail, and a cited source trail. Use them as examples after gathering notes with the worksheet.
            </p>
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
                    <span>{comic.published_at || "Undated"} - Sources: {sources || "listed on the reader page"}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="explainer-next" aria-labelledby="references">
            <div>
              <div className="kicker">Further reference</div>
              <h2 id="references">Interview And Legacy Resources</h2>
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

          <FaqSection
            heading="Obituary Writing Prompts FAQ"
            path="/obituary-writing-prompts/"
            items={faqs}
          />
        </ResourceLayout>
    </>
  );
}
