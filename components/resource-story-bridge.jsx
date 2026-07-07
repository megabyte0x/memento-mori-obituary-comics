import Image from "next/image";
import Link from "next/link";

import { comicPath, firstImagePath, imageSize, sourceItems } from "@/lib/comics";

const STORY_SLOTS = [
  { key: "featured", label: "Archival case study", cta: (comic) => `Read the ${comic.person} obituary comic` },
  { key: "latest", label: "Latest sourced story", cta: () => "Read the latest obituary comic" },
];

export function ResourceStoryBridge({ featuredComic, latestComic }) {
  const stories = STORY_SLOTS.map((slot) => ({
    ...slot,
    comic: slot.key === "featured" ? featuredComic : latestComic,
  }))
    .filter((story) => story.comic)
    .map((story) => ({ ...story, cta: story.cta(story.comic) }));

  if (!stories.length) return null;

  return (
    <section className="resource-story-bridge" aria-labelledby="research-story-bridge-title">
      <div className="resource-story-bridge-heading">
        <div className="kicker">Research in practice</div>
        <h2 id="research-story-bridge-title">See obituary research become a visual life story</h2>
        <p>
          These comics show how institutional records, published obituaries, and biographical sources become a verified visual narrative.
        </p>
      </div>

      <div className="resource-story-bridge-grid">
        {stories.map(({ comic, cta, label }) => {
          const firstPage = comic.pages?.[0] || "";
          const size = imageSize(comic, firstPage);
          const sourceCount = sourceItems(comic).length;

          return (
            <article className="resource-story-bridge-card" data-comic-slug={comic.slug} key={comic.slug}>
              <Link
                href={`${comicPath(comic)}#read`}
                className="resource-story-bridge-link"
                data-analytics-event="resource_story_clicked"
                data-comic-slug={comic.slug}
                aria-label={`${cta}: ${comic.person}`}
              >
                <div className="resource-story-bridge-cover">
                  <Image
                    src={firstImagePath(comic)}
                    alt={`${comic.person} obituary comic cover`}
                    width={size.width}
                    height={size.height}
                    sizes="(max-width: 640px) 82vw, (max-width: 1024px) 34vw, 220px"
                    loading="lazy"
                  />
                </div>
                <div className="resource-story-bridge-copy">
                  <span className="resource-story-bridge-label">{label}</span>
                  <h3>{comic.person}</h3>
                  <p>{comic.dek}</p>
                  <span className="resource-story-bridge-meta">
                    {comic.pages?.length || 0} comic pages <i aria-hidden="true" /> {sourceCount} {sourceCount === 1 ? "source" : "sources"}
                  </span>
                  <span className="resource-story-bridge-cta">{cta} <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <Link className="resource-story-bridge-archive" href="/#archive">
        Browse all obituary comics <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
