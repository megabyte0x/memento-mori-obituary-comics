"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { ComicShareButton } from "@/components/comic-share-button";
import { ComicSubscribeDialog } from "@/components/comic-subscribe-dialog";
import { trackActivity } from "@/components/mixpanel-analytics";
import { PdfSupportGate } from "@/components/pdf-support-gate";
import { Button } from "@/components/ui/button";
import { citableSummary, comicDescription, firstImagePath, imageSize, mediaPath, pageSummary, sourceItems, storyNotes } from "@/lib/comic-presenters";

export function ReaderShell({ comic, nextComic }) {
  const pages = comic.pages || [];

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
          {comic.person} · {comic.title}
        </div>
        <div className="reader-actions">
          <ComicShareButton comic={comic} surface="reader_toolbar" text="Share" titlePrefix="Share this comic" variant="reader" />
          {comic.pdf ? (
            <PdfSupportGate href={mediaPath(comic, comic.pdf)} comic={comic} surface="reader_toolbar_pdf" variant="readerPrimary" />
          ) : null}
        </div>
      </nav>

      <div className="sr-only">
        <h1>
          {comic.person} - {comic.title}
        </h1>
      </div>

      <main id="read" className="reader-pages layout-vertical" aria-label="Comic pages">
        {pages.map((src, index) => {
          const summary = pageSummary(comic, index + 1);
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
              <figcaption>{summary || `Page ${index + 1}`}</figcaption>
            </figure>
          );
        })}
      </main>

      <ReaderFooter comic={comic} nextComic={nextComic} />
    </>
  );
}

function ReaderFooter({ comic, nextComic }) {
  const sources = sourceItems(comic);
  return (
    <footer className="reader-footer">
      <div className="epilogue-card">
        <div className="epilogue-quote">“{comic.closing_line || ""}”</div>
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
      <section className="reader-context" aria-label="Comic notes and sources">
        <p className="reader-source-line">{comicDescription(comic)}</p>
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
      {nextComic ? (
        <div className="next-comic-teaser">
          <div className="next-kicker">Up Next</div>
          <Link href={`/comics/${nextComic.slug}/#read`} className="next-comic-link">
            <div className="next-cover">
              <Image
                src={firstImagePath(nextComic)}
                alt={`${nextComic.person} cover`}
                width={imageSize(nextComic, nextComic.pages?.[0] || "").width}
                height={imageSize(nextComic, nextComic.pages?.[0] || "").height}
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
