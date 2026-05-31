#!/usr/bin/env python3
"""Verify that generated static pages are connected to a Substack publication."""
from __future__ import annotations

import argparse
import os
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse, urlunparse

try:
    from scripts.add_comic import ROOT, SITE_URL
except ModuleNotFoundError:  # pragma: no cover - direct script execution fallback
    from add_comic import ROOT, SITE_URL


@dataclass
class LaunchVerification:
    substack_url: str
    action_url: str
    checked_comic_pages: int
    errors: list[str]


def normalize_substack_url(raw_url: str | None) -> str:
    value = (raw_url or "").strip()
    if not value:
        raise ValueError("SUBSTACK_URL is required.")

    parsed = urlparse(value)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError("SUBSTACK_URL must be an absolute https URL.")
    if parsed.scheme != "https":
        raise ValueError("SUBSTACK_URL must use https.")

    path = parsed.path.rstrip("/")
    if path == "/embed":
        path = ""

    return urlunparse(("https", parsed.netloc, path, "", "", ""))


def read_text(path: Path, errors: list[str]) -> str:
    if not path.exists():
        errors.append(f"Missing generated file: {path}")
        return ""
    return path.read_text(encoding="utf-8")


def require_contains(content: str, needle: str, label: str, errors: list[str]) -> None:
    if needle not in content:
        errors.append(f"{label} is missing {needle!r}.")


def verify_substack_launch(root: Path | str = ROOT, substack_url: str | None = None) -> LaunchVerification:
    errors: list[str] = []
    project_root = Path(root)

    try:
        normalized_url = normalize_substack_url(substack_url or os.environ.get("SUBSTACK_URL"))
    except ValueError as exc:
        normalized_url = ""
        errors.append(str(exc))

    action_url = f"{normalized_url}/api/v1/free?nojs=true" if normalized_url else ""

    newsletter_html = read_text(project_root / "newsletter" / "index.html", errors)
    if newsletter_html:
        if "Substack is ready to connect" in newsletter_html or "Add your Substack URL" in newsletter_html:
            errors.append("newsletter/index.html still contains the Substack placeholder.")
        if action_url:
            require_contains(newsletter_html, 'class="newsletter-form"', "newsletter form", errors)
            require_contains(newsletter_html, f'action="{action_url}"', "newsletter form", errors)
            require_contains(newsletter_html, 'name="email"', "newsletter form", errors)
            require_contains(newsletter_html, 'type="email"', "newsletter form", errors)
            if f'href="{normalized_url}"' in newsletter_html or "Open Substack" in newsletter_html:
                errors.append("newsletter/index.html still offers an external Substack redirect instead of relying on the embedded form.")
            if f'src="{normalized_url}/embed"' in newsletter_html or 'class="newsletter-embed"' in newsletter_html:
                errors.append("newsletter/index.html still uses the raw Substack embed as the visible signup UI.")

    homepage_html = read_text(project_root / "index.html", errors)
    if homepage_html and normalized_url:
        require_contains(homepage_html, 'class="newsletter-signup"', "homepage newsletter signup", errors)
        require_contains(homepage_html, 'class="newsletter-form"', "homepage newsletter signup", errors)
        require_contains(homepage_html, f'action="{action_url}"', "homepage newsletter signup", errors)
        require_contains(homepage_html, 'name="email"', "homepage newsletter signup", errors)
        require_contains(homepage_html, 'type="email"', "homepage newsletter signup", errors)
        if 'class="mini-btn primary newsletter-link"' in homepage_html:
            errors.append("homepage newsletter signup still uses an external Substack CTA instead of the embedded form.")
        if f'src="{normalized_url}/embed"' in homepage_html or 'class="newsletter-embed' in homepage_html:
            errors.append("homepage newsletter signup still uses the raw Substack embed as the visible signup UI.")

    comic_pages = sorted((project_root / "comics").glob("*/index.html"))
    if not comic_pages:
        errors.append("No generated comic pages found under comics/*/index.html.")
    for page in comic_pages:
        html = read_text(page, errors)
        if not html or not normalized_url:
            continue
        require_contains(html, 'class="newsletter-signup reader-newsletter"', str(page), errors)
        require_contains(html, 'class="newsletter-form"', str(page), errors)
        require_contains(html, f'action="{action_url}"', str(page), errors)
        require_contains(html, 'name="email"', str(page), errors)
        require_contains(html, 'type="email"', str(page), errors)
        if 'class="mini-btn primary newsletter-link"' in html:
            errors.append(f"{page} still uses an external Substack CTA instead of the embedded form.")
        if f'src="{normalized_url}/embed"' in html or 'class="newsletter-embed' in html:
            errors.append(f"{page} still uses the raw Substack embed as the visible signup UI.")

    sitemap = read_text(project_root / "sitemap.xml", errors)
    if sitemap:
        require_contains(sitemap, f"<loc>{SITE_URL}/newsletter/</loc>", "sitemap.xml", errors)

    return LaunchVerification(
        substack_url=normalized_url,
        action_url=action_url,
        checked_comic_pages=len(comic_pages),
        errors=errors,
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verify generated Substack launch artifacts.")
    parser.add_argument("--root", type=Path, default=ROOT, help="Project root containing generated HTML.")
    parser.add_argument("--url", default=os.environ.get("SUBSTACK_URL"), help="Substack publication URL.")
    args = parser.parse_args(argv)

    result = verify_substack_launch(args.root, args.url)
    if result.errors:
        print("Substack launch verification failed:")
        for error in result.errors:
            print(f"- {error}")
        return 1

    print(f"Substack launch verification passed for {result.substack_url}")
    print(f"Signup action: {result.action_url}")
    print(f"Checked comic pages: {result.checked_comic_pages}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
