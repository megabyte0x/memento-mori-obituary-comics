import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteNav } from "@/components/site-nav";
import { ThemeEntryList } from "@/components/theme-entry-list";
import { comicImageMetadata, comicUrl } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import { absoluteUrl, publisherSchema, SITE_LANGUAGE, SITE_URL } from "@/lib/site";
import { comicsForTheme, getTheme, themePath, themesWithComics } from "@/lib/themes";

async function loadTheme(params) {
  const { theme: slug } = await params;
  const theme = getTheme(slug);
  if (!theme) return null;
  const comics = await loadRuntimeComics();
  const members = comicsForTheme(comics, theme.slug);
  return members.length ? { theme, members, comics } : null;
}

export async function generateMetadata({ params }) {
  const data = await loadTheme(params);
  if (!data) return {};
  const { theme, members } = data;
  const images = comicImageMetadata(members[0]);
  return {
    title: theme.title,
    description: theme.description,
    alternates: { canonical: themePath(theme) },
    openGraph: { type: "website", title: theme.title, description: theme.description, url: themePath(theme), images },
    twitter: { card: "summary_large_image", title: theme.title, description: theme.description, images },
  };
}

function themeSchema(theme, members) {
  const url = absoluteUrl(themePath(theme));
  return {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: theme.title,
        description: theme.description,
        inLanguage: SITE_LANGUAGE,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          name: theme.title,
          numberOfItems: members.length,
          itemListElement: members.map((comic, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: comicUrl(comic),
            name: comic.person,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Themes", item: absoluteUrl("/themes/") },
          { "@type": "ListItem", position: 3, name: theme.name, item: url },
        ],
      },
    ],
  };
}

export default async function ThemePage({ params }) {
  const data = await loadTheme(params);
  if (!data) notFound();
  const { theme, members, comics } = data;
  const others = themesWithComics(comics).filter((entry) => entry.theme.slug !== theme.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(themeSchema(theme, members)) }} />
      <header className="theme-hero">
        <SiteNav />
        <div className="wrap theme-hero-copy">
          <nav className="reader-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/themes/">Themes</Link></li>
              <li aria-current="page">{theme.name}</li>
            </ol>
          </nav>
          <div className="kicker">{members.length} illustrated biographies</div>
          <h1>{theme.title}</h1>
          {theme.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </header>
      <main className="wrap section theme-section">
        <ThemeEntryList comics={members} />
      </main>
      <nav className="wrap section theme-others" aria-labelledby="theme-others-title">
        <h2 id="theme-others-title">More themes</h2>
        <ul className="theme-chips">
          {others.map(({ theme: other, comics: list }) => (
            <li key={other.slug}>
              <Link href={themePath(other)}>
                {other.name} <span>({list.length})</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <footer>
        <Link href="/#archive">Full archive</Link> · <Link href="/about/">Editorial method</Link>
      </footer>
    </>
  );
}
