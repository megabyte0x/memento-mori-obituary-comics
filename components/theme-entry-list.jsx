import Image from "next/image";
import Link from "next/link";

import { comicPath, firstImagePath, imageSize } from "@/lib/comics";

export function ThemeEntryList({ comics }) {
  return (
    <ol className="theme-entries">
      {comics.map((comic) => {
        const size = imageSize(comic, comic.pages?.[0] || "");
        return (
          <li className="theme-entry" key={comic.slug}>
            <Link className="theme-entry-cover" href={comicPath(comic)} tabIndex={-1} aria-hidden="true">
              <Image src={firstImagePath(comic)} alt="" width={size.width} height={size.height} sizes="(max-width: 680px) 28vw, 150px" loading="lazy" />
            </Link>
            <div className="theme-entry-copy">
              <h2>
                <Link href={comicPath(comic)}>{comic.person}</Link>
                {comic.years ? <>{" "}<span className="theme-entry-years">({comic.years})</span></> : null}
              </h2>
              {comic.dek ? <p className="theme-entry-dek">{comic.dek}</p> : null}
              {comic.mortality_event ? <p className="theme-entry-event">{comic.mortality_event}</p> : null}
              <Link className="theme-entry-read" href={comicPath(comic)}>
                Read {comic.person}&rsquo;s comic
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
