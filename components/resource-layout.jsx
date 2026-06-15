"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X, BookOpen } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export const RESOURCE_CATEGORIES = [
  {
    id: "writing",
    label: "Obituary Writing Guides",
    links: [
      { href: "/how-to-write-an-obituary-story/", label: "Writing Guide", desc: "Turn a memory or record into a sourced life story." },
      { href: "/obituary-writing-prompts/", label: "Writing Prompts", desc: "Memory prompts and legacy interview questions." },
      { href: "/obituary-wording/", label: "Wording Examples", desc: "Phrasing for opening lines, family lists, and services." },
      { href: "/memorial-donation-wording-obituary/", label: "Donation Wording", desc: "Wording for charity designations and memorial gifts." },
      { href: "/life-story-obituary-template/", label: "Obituary Template", desc: "Copyable structures for biography-focused obituaries." },
      { href: "/obituary-story-worksheet/", label: "Printable Worksheet", desc: "Gather facts and sketch out a life story on paper." },
    ]
  },
  {
    id: "planning",
    label: "Checklists & Costs",
    links: [
      { href: "/obituary-checklist/", label: "Obituary Checklist", desc: "Essential facts and proofing checklists before publishing." },
      { href: "/obituary-mistakes-to-avoid/", label: "Mistakes to Avoid", desc: "Common errors, cost surprises, and safety issues." },
      { href: "/obituary-cost/", label: "Obituary Cost Guide", desc: "Word limits, print packages, and funeral-home cash advances." },
      { href: "/how-to-submit-an-obituary-to-a-newspaper/", label: "Newspaper Submission", desc: "Placement deadlines, pricing, and proof-of-death rules." },
      { href: "/what-not-to-include-in-an-obituary/", label: "Privacy Checklist", desc: "What details to leave out for family privacy and home safety." },
      { href: "/fake-obituary-sites/", label: "Fake Obituary Sites", desc: "Avoid copied notices, piracy, and fake listing sites." },
    ]
  },
  {
    id: "explainers",
    label: "Explainers & Formats",
    links: [
      { href: "/what-are-obituary-comics/", label: "Obituary Comics", desc: "Definition of visual, source-backed biographical stories." },
      { href: "/obituary-vs-death-notice/", label: "Notice vs Obituary", desc: "Basics of a death listing versus a narrative life story." },
      { href: "/obituary-vs-eulogy/", label: "Eulogy vs Obituary", desc: "Spoken memorial tributes versus written permanent records." },
      { href: "/short-obituary-examples/", label: "Short Examples", desc: "Copy-ready brief notices and death announcements." },
      { href: "/obituary-examples/", label: "Standard Examples", desc: "Narrative story patterns and bio-comic leads." },
      { href: "/obituary-research-guide/", label: "Research Guide", desc: "Genealogy search, public records, and library archives." },
    ]
  },
  {
    id: "method",
    label: "Resources & Method",
    links: [
      { href: "/free-obituary-generator/", label: "Obituary Generator", desc: "Private, browser-based draft builder from verified facts." },
      { href: "/obituary-stories/", label: "Stories Archive", desc: "Sourced visual biographies and article index." },
      { href: "/obituary-articles/", label: "Obituary Articles", desc: "Crawlable text and source trails for search engines." },
      { href: "/educators-libraries/", label: "Educators & Libraries", desc: "Course packs, classroom reading, and library catalogs." },
      { href: "/obituary-lesson-plan/", label: "Obituary Lesson Plan", desc: "Secondary school unit for obituary analysis." },
      { href: "/about/", label: "Editorial Method", desc: "Authorship, verification standards, and editorial code." },
      { href: "/press/", label: "Press Resources", desc: "Media kit and review resources for editors." },
    ]
  }
];

export function ResourceLayout({ currentPath, kicker, title, description, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Find the category of the current page and gather related resources
  const activeCategory = RESOURCE_CATEGORIES.find(category =>
    category.links.some(link => link.href === currentPath)
  );

  const relatedLinks = activeCategory
    ? activeCategory.links.filter(link => link.href !== currentPath)
    : [];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(currentPath || "/")}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      ...(activeCategory ? [{ "@type": "ListItem", position: 2, name: activeCategory.label }] : []),
      {
        "@type": "ListItem",
        position: activeCategory ? 3 : 2,
        name: title,
        item: absoluteUrl(currentPath || "/"),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SiteNav />
      <div className="resource-page-wrapper">
        {/* Mobile Sidebar Toggle Button */}
        <div className="mobile-directory-bar wrap">
          <button
            className="mobile-directory-trigger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Resource Directory"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            <span>Directory Guide Hub</span>
          </button>
        </div>

        <div className="resource-layout-grid wrap">
          {/* Sidebar Navigation */}
          <aside className={`resource-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
            <div className="sidebar-inner">
              <div className="sidebar-title">
                <BookOpen size={14} className="sidebar-title-icon" />
                <span>Resources Directory</span>
              </div>
              <nav className="sidebar-nav" aria-label="Directory Navigation">
                {RESOURCE_CATEGORIES.map(category => (
                  <div className="sidebar-group" key={category.id}>
                    <h3>{category.label}</h3>
                    <ul>
                      {category.links.map(link => {
                        const isActive = link.href === currentPath;
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className={`sidebar-link ${isActive ? "active" : ""}`}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <span>{link.label}</span>
                              <ChevronRight className="sidebar-link-chevron" size={10} />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Article Content */}
          <main className="resource-main-content">
            <article className="resource-article">
              <header className="resource-header">
                {kicker && <div className="kicker">{kicker}</div>}
                <h1>{title}</h1>
                {description && <p className="resource-lead-desc">{description}</p>}
              </header>

              <div className="resource-body-content">
                {children}
              </div>

              {/* Related Resources Grid */}
              {relatedLinks.length > 0 && (
                <section className="related-resources-section" aria-labelledby="related-title">
                  <div className="related-divider">
                    <span />
                    <i aria-hidden="true" />
                    <span />
                  </div>
                  <h2 id="related-title">Related Resources</h2>
                  <div className="related-resources-grid">
                    {relatedLinks.map(link => (
                      <Link href={link.href} className="related-resource-card" key={link.href}>
                        <h3>{link.label}</h3>
                        <p>{link.desc}</p>
                        <span className="card-arrow">Read Guide →</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </main>
        </div>
      </div>

      <footer className="resource-footer">
        <div className="wrap">
          <p>Source-backed visual obituaries. Clean comics, verified lives, no motivational slop.</p>
          <div className="footer-links">
            <Link href="/">Home Archive</Link>
            <span>·</span>
            <Link href="/about/">Editorial Method</Link>
            <span>·</span>
            <Link href="/press/">Press Resources</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
