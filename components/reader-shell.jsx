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
  citationPassage, citableSummary, comicDescription, comicFaq, imageSize, lifeFacts, mediaPath, pageSummary,
  pageTranscript, sourceItems, storyNotes, storyTitle,
} from "@/lib/comic-presenters";

export function ReaderShell({ comic, nextComic, themes = [], related = [] }) {
  const pages = comic.pages || [];
  const passage = citationPassage(comic);
  const sources = sourceItems(comic);
  const story = storyTitle(comic);
  const heading = story ? `${comic.person}: ${story}` : comic.person;
  const facts = lifeFacts(comic);
  const primary = themes[0];

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

      <section className="reader-introduction" aria-labelledby="reader-introduction-title">
        <nav className="reader-breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            {primary ? <li><Link href={primary.href}>{primary.name}</Link></li> : null}
            <li aria-current="page">{comic.person}</li>
          </ol>
        </nav>
        <p className="reader-introduction-kicker">
          Illustrated biography comic{facts.years ? ` · ${facts.years}` : ""}{pages.length ? ` · ${pages.length} pages` : ""} ·{" "}
          <time dateTime={comic.published_at}>Published {comic.published_at}</time>
        </p>
        <h1 id="reader-introduction-title">{heading}</h1>
        {comic.dek ? <p className="reader-introduction-dek">{comic.dek}</p> : null}
        <LifeFacts comic={comic} facts={facts} />
        {passage ? (
          <>
            <h2 className="reader-introduction-question">Who was {comic.person}?</h2>
            <p className="reader-introduction-passage">{passage}</p>
          </>
        ) : null}
        {sources.length ? (
          <div className="reader-introduction-sources">
            <span>Sources</span>
            <ul>
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
          </div>
        ) : null}
      </section>

      <main id="read" className="reader-pages layout-vertical has-introduction" aria-label="Comic pages">
        {pages.map((src, index) => {
          const summary = pageSummary(comic, index + 1);
          const transcript = pageTranscript(comic, index + 1);
          const size = imageSize(comic, src);
          return (
            <figure className="reader-page" id={`page-${String(index + 1).padStart(2, "0")}`} key={src}>
              <Image
                src={mediaPath(comic, src)}
                alt={`Page ${index + 1} of ${comic.person}: ${comic.title}${summary ? ` - ${summary}` : ""}`}
                width={size.width}
                height={size.height}
                sizes="(max-width: 900px) 100vw, 900px"
                preload={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
              />
              <figcaption className={summary ? "reader-page-summary" : undefined}>{summary || `Page ${index + 1}`}</figcaption>
              {transcript ? (
                <details className="reader-page-transcript">
                  <summary>Page {index + 1} text and panel descriptions</summary>
                  {transcript.split(/\n{2,}|\n/).filter(Boolean).map((line, lineIndex) => (
                    <p key={lineIndex}>{line}</p>
                  ))}
                </details>
              ) : null}
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
  const closingLine = String(comic.closing_line || "").trim();
  return (
    <footer className="reader-footer">
      {closingLine ? (
        <div className="epilogue-card">
          <div className="epilogue-quote">“{closingLine}”</div>
          <div className="epilogue-sources">
            {sources.map((source) => (
              source.url ? (
                <a className="source-chip" href={source.url} rel="noopener noreferrer" target="_blank" key={source.name}>
                  {source.name}
                </a>
              ) : (
                <span className="source-chip" key={source.name}>
                  {source.name}
                </span>
              )
            ))}
          </div>
        </div>
      ) : null}
      <section className="reader-context" aria-label="Comic notes and sources">
        <p className="reader-source-line">{comicDescription(comic)}</p>
        {faq.length ? (
          <section className="reader-faq" aria-labelledby="reader-faq-title">
            <h2 id="reader-faq-title">Questions about {comic.person}</h2>
            {faq.map((item) => (
              <div className="reader-faq-item" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </section>
        ) : null}
        <h2>Citable Summary</h2>
        <ul className="summary-list">
          {citableSummary(comic).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h2>Story Notes</h2>
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
        {comic.pdf ? (
          <>
            <h2>Download PDF</h2>
            <p>
              <PdfSupportGate href={mediaPath(comic, comic.pdf)} comic={comic} surface="reader_footer_pdf" variant="miniPrimary" label="Download the PDF" />
            </p>
          </>
        ) : null}
        <h2>Share This Story</h2>
        <p>
          Pass the canonical reader link into a group chat, Reddit thread, or note-taking tool without making people hunt through raw image URLs.
        </p>
        <p>
          <ComicShareButton comic={comic} surface="reader_footer" text="Share the reader link" titlePrefix="Share this comic" variant="miniPrimary" />
        </p>
      </section>
      <ComicSubscribeDialog comic={comic} />
      {related.length ? (
        <section className="related-lives" aria-labelledby="related-lives-title">
          <div className="next-kicker">More lives like this</div>
          <h2 id="related-lives-title">If {comic.person}&rsquo;s story stayed with you</h2>
          {themes.length ? (
            <ul className="theme-chips" aria-label="Themes">
              {themes.map((theme) => (
                <li key={theme.slug}>
                  <Link href={theme.href}>{theme.name}</Link>
                </li>
              ))}
            </ul>
          ) : null}
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
                    <span>{item.dek}</span>
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
              <p>{nextComic.dek}</p>
            </div>
          </Link>
        </div>
      ) : null}
    </footer>
  );
}
