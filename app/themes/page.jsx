import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_URL } from "@/lib/site";
import { themePath, themesWithComics } from "@/lib/themes";

const title = "Biography Comics by Theme";
const description =
  "Browse illustrated, source-backed biography comics by theme: cancer, blindness, disability, the Holocaust, prison, war, artists, writers, scientists, and more.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/themes/" },
  openGraph: { type: "website", title, description, url: "/themes/" },
};

export default async function ThemesIndexPage() {
  const entries = themesWithComics(await loadRuntimeComics());
  const url = absoluteUrl("/themes/");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: SITE_LANGUAGE,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: entries.map(({ theme }, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(themePath(theme)),
            name: theme.title,
          })),
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="theme-hero">
        <SiteNav />
        <div className="wrap theme-hero-copy">
          <nav className="reader-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li aria-current="page">Themes</li>
            </ol>
          </nav>
          <h1>{title}</h1>
          <p>Every comic follows a real person through a direct encounter with death, illness, captivity, or loss. Start from what they faced or from the kind of work they made.</p>
        </div>
      </header>
      <main className="wrap section">
        <ul className="theme-index">
          {entries.map(({ theme, comics }) => (
            <li key={theme.slug}>
              <Link className="theme-index-card" href={themePath(theme)}>
                <span className="kicker">{comics.length} lives</span>
                <strong>{theme.title}</strong>
                <span>{comics.slice(0, 4).map((comic) => comic.person).join(", ")}{comics.length > 4 ? ", and more" : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <footer>
        <Link href="/#archive">Full archive</Link> · <Link href="/about/">Editorial method</Link>
      </footer>
    </>
  );
}
