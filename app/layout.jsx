import { Suspense } from "react";
import { Cinzel, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

import "@/app/globals.css";

import { MixpanelAnalytics } from "@/components/mixpanel-analytics";
import { comicImageMetadata, getLatestComic } from "@/lib/comics";
import { loadRuntimeComics } from "@/lib/runtime-comics";
import {
  SITE_CATEGORY,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_SHORT_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

const displayFont = Cinzel({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: "variable",
});

const serifFont = Cormorant_Garamond({
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: "variable",
});

const sansFont = Plus_Jakarta_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: "variable",
});

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const defaultImages = comicImageMetadata(getLatestComic(await loadRuntimeComics()));
  return {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_SHORT_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: SITE_CATEGORY,
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    images: defaultImages,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: defaultImages,
  },
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      className={`${displayFont.variable} ${serifFont.variable} ${sansFont.variable}`}
      lang="en"
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} RSS feed`} href="/feed.xml" />
      </head>
      <body>
        {children}
        <Suspense fallback={null}>
          <MixpanelAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
