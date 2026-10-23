"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { ComicShareButton } from "@/components/comic-share-button";
import { ComicSubscribeDialog } from "@/components/comic-subscribe-dialog";
import { trackActivity } from "@/components/mixpanel-analytics";
import { PdfSupportGate } from "@/components/pdf-support-gate";
import { Button } from "@/components/ui/button";
import {
  citationPassage, citableSummary, comicFaq, imageSize, lifeFacts, mediaPath, pageSummary,
  pageTranscript, sourceItems, storyNotes, storyTitle,
} from "@/lib/comic-presenters";

export function ReaderShell({ comic, nextComic, themes = [], related = [] }) {
  const pages = comic.pages || [];
  const story = storyTitle(comic);
  const heading = story ? `${comic.person}: ${story}` : comic.person;
  const facts = lifeFacts(comic);

  useEffect(() => {
    trackActivity("comic_reader_loaded", {
      comic_slug: comic.slug,
      person: comic.person,
      page_count: pages.length,
      has_pdf: Boolean(comic.pdf),
      source_count: sourceItems(comic).length,
    });
  }, [comic.pdf, comic.person, comic.slug, pages.length]);

  useEffect(() => {
    document.body.classList.add("reader-mode");
    return () => {
      document.body.classList.remove("reader-mode");
    };
  }, []);

  return (
    <>
      <nav className="reader-toolbar" aria-label="Reader controls" id="readerToolbar">
        <Button asChild variant="reader" className="reader-back">
          <Link href="/">← Archive</Link>
        </Button>
        <div className="reader-title">
          {heading}
        </div>
        <div className="reader-actions">
          <ComicShareButton comic={comic} surface="reader_toolbar" text="Share" titlePrefix="Share this comic" variant="reader" />
          {comic.pdf ? (
            <PdfSupportGate href={mediaPath(comic, comic.pdf)} comic={comic} surface="reader_toolbar_pdf" variant="readerPrimary" />
          ) : null}
        </div>
      </nav>

      <header className="reader-introduction">
        <p className="reader-introduction-kicker">
          {[facts.years, pages.length ? `${pages.length} pages` : ""].filter(Boolean).join(" · ")}
        </p>
        <h1>{heading}</h1>
      </header>

      <main id="read" className="reader-pages layout-vertical has-introduction" aria-label="Comic pages">
        {pages.map((src, index) => {
          const summary = pageSummary(comic, index + 1);
          const transcript = pageTranscript(comic, index + 1);
          const size = imageSize(comic, src);
          return (
            <figure className="reader-page" id={`page-${String(index + 1).padStart(2, "0")}`} key={src}>
              <Image
                src={mediaPath(comic, src)}
                alt={`Page ${index + 1} of ${comic.person}: ${storyTitle(comic) || comic.title}${summary ? ` - ${summary}` : ""}`}
                width={size.width}
                height={size.height}
                sizes="(max-width: 900px) 100vw, 900px"
                preload={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
              />
              {/* The words are printed on the page; keep a text equivalent for screen readers only. */}
              <figcaption className="sr-only">
                {summary || `Page ${index + 1}`}
                {transcript ? <span className="reader-page-transcript">{transcript}</span> : null}
              </figcaption>
            </figure>
          );
        })}
      </main>

      <ReaderFooter comic={comic} nextComic={nextComic} themes={themes} related={related} />
    </>
  );
}

function LifeFacts({ comic, facts }) {
  const rows = [
    facts.born ? ["Born", facts.born] : null,
    facts.died ? ["Died", `${facts.died}${facts.age !== null ? ` (aged ${facts.age})` : ""}`] : null,
    !facts.born && !facts.died && facts.years ? ["Lived", facts.years] : null,
    comic.mortality_event ? ["Turning point", comic.mortality_event] : null,
  ].filter(Boolean);
  if (!rows.length) return null;
  return (
    <dl className="reader-facts">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReaderFooter({ comic, nextComic, themes, related }) {
  const sources = sourceItems(comic);
  const faq = comicFaq(comic);
  const passage = citationPassage(comic);
  const primary = themes[0];
  return (
    <footer className="reader-footer">
      <details className="reader-context">
        <summary>About this story &amp; sources</summary>
        <nav className="reader-breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            {primary ? <li><Link href={primary.href}>{primary.name}</Link></li> : null}
            <li aria-current="page">{comic.person}</li>
          </ol>
        </nav>
        {comic.dek ? <p>{comic.dek}</p> : null}
        <LifeFacts comic={comic} facts={lifeFacts(comic)} />
        {passage ? <p>{passage}</p> : null}
        {faq.map((item) => (
          <div className="reader-faq-item" key={item.question}>
            <h3>{item.question}</h3>
            <p>
              {item.answer}
              {item.sourceUrl && !item.sourceUrl.includes(`/comics/${comic.slug}/`) ? (
                <>
                  {" "}
                  <a className="reader-faq-source" href={item.sourceUrl} rel="noopener noreferrer" target="_blank">
                    Source
                  </a>
                </>
              ) : null}
            </p>
          </div>
        ))}
        <ul className="summary-list">
          {citableSummary(comic).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {storyNotes(comic).map((item) => (
          <p key={item}>{item}</p>
        ))}
        <h2>Sources</h2>
        <ul className="source-list">
          {sources.map((source) => (
            <li key={source.name}>
              {source.url ? (
                <a href={source.url} rel="noopener noreferrer" target="_blank">
                  {source.name}
                </a>
              ) : (
                source.name
              )}
            </li>
          ))}
        </ul>
        <p>Published <time dateTime={comic.published_at}>{comic.published_at}</time></p>
      </details>
      <ComicSubscribeDialog comic={comic} />
      {related.length ? (
        <section className="related-lives" aria-labelledby="related-lives-title">
          <h2 id="related-lives-title">More lives like this</h2>
          <ul className="related-lives-grid">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/comics/${item.slug}/`} className="related-life">
                  {item.cover ? (
                    <Image src={item.cover} alt="" width={item.width} height={item.height} sizes="(max-width: 760px) 30vw, 140px" loading="lazy" />
                  ) : null}
                  <span className="related-life-copy">
                    <strong>{item.person}</strong>
                    {item.years ? <span className="related-life-years">{item.years}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {nextComic ? (
        <div className="next-comic-teaser">
          <div className="next-kicker">Up Next</div>
          <Link href={`/comics/${nextComic.slug}/#read`} className="next-comic-link">
            <div className="next-cover">
              <Image
                src={nextComic.cover}
                alt={`${nextComic.person} cover`}
                width={nextComic.width}
                height={nextComic.height}
                sizes="(max-width: 760px) 45vw, 220px"
                loading="lazy"
              />
            </div>
            <div className="next-info">
              <h4>{nextComic.person}</h4>
            </div>
          </Link>
        </div>
      ) : null}
    </footer>
  );
}
