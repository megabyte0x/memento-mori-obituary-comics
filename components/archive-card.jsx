import Link from "next/link";
import Image from "next/image";

import { ComicShareButton } from "@/components/comic-share-button";
import { PdfSupportGate } from "@/components/pdf-support-gate";
import { firstImagePath, imageSize, mediaPath } from "@/lib/comic-presenters";

export function ArchiveCard({ comic, priority = false }) {
  const cover = firstImagePath(comic);
  const image = comic.pages?.[0] || "";
  const size = imageSize(comic, image);
  const titleLength = comic.person.length;
  const titleSizeClass = titleLength > 28 ? "archive-card--very-long-name" : titleLength > 22 ? "archive-card--long-name" : "";

  return (
    <article className={`archive-card ${titleSizeClass}`.trim()} data-comic-slug={comic.slug}>
      <Link className="archive-card-link" href={`/comics/${comic.slug}/#read`} aria-label={`Read ${comic.person} obituary comic`} />
      <div className="archive-cover" aria-hidden="true">
        <Image
          src={cover}
          alt={`${comic.person} obituary comic cover`}
          width={size.width}
          height={size.height}
          sizes="(max-width: 900px) 100vw, 33vw"
          preload={priority}
          loading={priority ? undefined : "lazy"}
          fetchPriority={priority ? "high" : undefined}
        />
      </div>
      <div className="archive-copy">
        <div className="meta">
          {comic.published_at} · {comic.years}
        </div>
        <h3>{comic.person}</h3>
        <p>{comic.dek}</p>
        <div className="archive-actions">
          <ComicShareButton comic={comic} surface="archive_card" />
          {comic.pdf ? (
            <PdfSupportGate href={mediaPath(comic, comic.pdf)} comic={comic} surface="archive_card_pdf" />
          ) : null}
        </div>
      </div>
    </article>
  );
}
