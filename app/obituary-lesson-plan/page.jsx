import Link from "next/link";

import { ResourceLayout } from "@/components/resource-layout";
import { Button } from "@/components/ui/button";
import { comicPath, getComics, sourceItems } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "An obituary lesson plan for journalism, ELA, media writing, and family-history classes, with source-backed visual obituary examples and assessment prompts.";

const lessonBlocks = [
  {
    title: "Warm-up: notice, article, or eulogy",
    time: "10 minutes",
    text: "Ask students to compare a death notice, a feature obituary, and a short visual obituary. Identify which facts are verified, which details create story, and which parts belong in a private tribute instead of a public article.",
  },
  {
    title: "Mini lesson: what an obituary article does",
    time: "15 minutes",
    text: "Define the obituary article as reported life-story writing. It announces a death, but it also explains why the person mattered through record checks, interviews, scenes, chronology, and editorial judgment.",
  },
  {
    title: "Source check: evidence before style",
    time: "15 minutes",
    text: "Have students mark names, dates, places, public claims, family relationships, awards, work history, service details, and source uncertainty before drafting any emotional language.",
  },
  {
    title: "Draft: lead, life, scene, legacy",
    time: "25 minutes",
    text: "Students write a 350-500 word obituary article for a historical figure, public figure, fictional character, or approved family-history subject using one concrete scene or object as the story anchor.",
  },
  {
    title: "Peer review: sensitivity and verification",
    time: "15 minutes",
    text: "Pairs check whether the draft is accurate, specific, respectful, and clear to readers who did not know the subject. They also mark any details that should be removed or moved private.",
  },
];

const rubric = [
  "Lead names the subject, death context, and significance without turning the article into a list.",
  "Draft includes verified names, dates, places, relationships, and at least two source notes.",
  "One concrete scene, object, quote, route, room, photograph, or action makes the life specific.",
  "Tone is respectful, readable, and appropriate for a public classroom or journalism audience.",
  "Student can explain what was kept public, cut, or moved private.",
];

const adaptations = [
  {
    title: "Journalism",
    text: "Treat it as a feature obituary assignment: reporting, source attribution, AP-style restraint, and a lead that makes the subject's significance clear.",
  },
  {
    title: "ELA",
    text: "Use the assignment to teach structure, tone, point of view, summary, and concrete detail in nonfiction writing.",
  },
  {
    title: "Family history",
    text: "Ask students to turn records, clippings, photographs, or oral-history notes into a sourced life-story paragraph.",
  },
  {
    title: "Visual storytelling",
    text: "Have students storyboard four panels: verified fact, pressure point, subject in action, and what remains.",
  },
];

const referenceLinks = [
  {
    label: "SchoolJournalism lesson plans",
    href: "https://www.schooljournalism.org/lesson-plans-4/",
    note: "Journalism lesson-plan archive for teachers and advisers.",
  },
  {
    label: "SchoolJournalism about page",
    href: "https://www.schooljournalism.org/about/",
    note: "Contributor context and contact path for journalism education resources.",
  },
  {
    label: "JEA writing curriculum",
    href: "https://jea.org/curriculum-library/writing/",
    note: "Journalism Education Association writing resources for classrooms.",
  },
  {
    label: "PBS Written in Stone",
    href: "https://www.pbs.org/opb/historydetectives/educators/technique-guide/written-in-stone/index.html",
    note: "History Detectives classroom activity that includes obituary writing from historical evidence.",
  },
  {
    label: "Share My Lesson contact",
    href: "https://sharemylesson.com/contact-us",
    note: "Teacher-resource platform with upload and partner contact paths.",
  },
  {
    label: "Scholastic Upfront lesson",
    href: "https://upfront.scholastic.com/issues/2023-24/012924/overlooked-no-more/lesson-plan-overlooked-no-more.html",
    note: "Classroom lesson using obituary research and writing prompts.",
  },
];

export const metadata = {
  title: "Obituary Lesson Plan for Journalism and ELA",
  description,
  keywords: [
    "obituary lesson plan",
    "obituary writing lesson plan",
    "obituary article lesson",
    "journalism obituary lesson",
    "ELA obituary writing lesson",
    "visual obituary lesson plan",
    "obituary stories for students",
  ],
  alternates: {
    canonical: "/obituary-lesson-plan/",
  },
  openGraph: {
    type: "article",
    title: `Obituary Lesson Plan for Journalism and ELA | ${SITE_NAME}`,
    description,
    url: "/obituary-lesson-plan/",
  },
  twitter: {
    title: `Obituary Lesson Plan for Journalism and ELA | ${SITE_NAME}`,
    description,
  },
};

export default async function ObituaryLessonPlanPage() {
  const comics = await loadRuntimeComics();
  const latestDate = comics.reduce((max, comic) => (comic.published_at > max ? comic.published_at : max), "2026-06-04");
  const featured = comics.slice(0, 4);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": ["Article", "LearningResource"],
        "@id": `${SITE_URL}/obituary-lesson-plan/#lesson`,
        headline: "Obituary Lesson Plan for Journalism and ELA",
        name: "Obituary Lesson Plan for Journalism and ELA",
        url: absoluteUrl("/obituary-lesson-plan/"),
        description,
        inLanguage: SITE_LANGUAGE,
        datePublished: "2026-06-04",
        dateModified: latestDate,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${SITE_URL}/obituary-lesson-plan/#webpage` },
        about: ["obituary lesson plan", "journalism lesson plan", "obituary articles", "visual obituaries"],
        educationalLevel: ["High school", "College", "Adult education"],
        learningResourceType: "Lesson plan",
        teaches: [
          "obituary article structure",
          "source verification",
          "feature writing",
          "sensitive public storytelling",
          "visual biography",
        ],
        mainEntity: {
          "@type": "ItemList",
          name: "Obituary lesson plan sequence",
          itemListElement: lessonBlocks.map((block, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: block.title,
            description: `${block.time}: ${block.text}`,
          })),
        },
        citation: referenceLinks.map((reference) => reference.href),
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/obituary-lesson-plan/#webpage`,
        name: "Obituary Lesson Plan for Journalism and ELA",
        url: absoluteUrl("/obituary-lesson-plan/"),
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
        currentPath="/obituary-lesson-plan/"
        kicker="Obituary lesson plan"
        title="Obituary Lesson Plan"
        description={description}
      >

          <section className="explainer-body" aria-labelledby="lesson-purpose">
            <h2 id="lesson-purpose">Lesson Purpose</h2>
            <p>
              This obituary lesson plan helps students understand the difference between a death notice, eulogy, reported obituary article, and visual obituary. It works for journalism, ELA, media writing, creative nonfiction, and family-history classes.
            </p>
            <p>
              The classroom goal is accuracy before polish. Students gather facts, check sources, choose one concrete life detail, and decide what should stay public, what should be cut, and what belongs in a private family note.
            </p>
          </section>

          <section className="worksheet-grid" aria-labelledby="lesson-sequence">
            <div>
              <div className="kicker">80-90 minutes</div>
              <h2 id="lesson-sequence">Classroom Sequence</h2>
            </div>
            <div className="worksheet-fields">
              {lessonBlocks.map((block) => (
                <section className="worksheet-box" key={block.title}>
                  <h3>{block.title}</h3>
                  <p><strong>{block.time}</strong></p>
                  <p>{block.text}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="explainer-principles" aria-labelledby="adaptations">
            <div>
              <div className="kicker">Adaptations</div>
              <h2 id="adaptations">Use It In Four Course Types</h2>
            </div>
            <div className="stories-intent-list">
              {adaptations.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="explainer-body" aria-labelledby="assessment">
            <h2 id="assessment">Assessment Checklist</h2>
            <ul className="writing-guide-list">
              {rubric.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="explainer-next" aria-labelledby="examples">
            <div>
              <div className="kicker">Student reading set</div>
              <h2 id="examples">Source-Backed Visual Obituary Examples</h2>
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
                    <span>{comic.published_at || "Undated"} - Sources: {sources || "listed on the reader page"}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="explainer-next" aria-labelledby="references">
            <div>
              <div className="kicker">Further reference</div>
              <h2 id="references">Teaching And Journalism Resources</h2>
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

          
        </ResourceLayout>
    </>
  );
}
