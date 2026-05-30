#!/usr/bin/env python3
"""Add a generated obituary comic directory to this static site.

Expected source directory: contains pages/*.jpg and optionally a PDF/contact sheet.
Usage:
  python scripts/add_comic.py SOURCE_DIR --slug person-slug --person "Name" --title "Title" --years "1900–2000" --dek "Short dek" --event "mortality event" --sources "A; B; C"
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "comic"


def load_comics() -> list[dict]:
    path = ROOT / "comics.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def save_comics(comics: list[dict]) -> None:
    (ROOT / "comics.json").write_text(json.dumps(comics, indent=2, ensure_ascii=False), encoding="utf-8")


def analytics_head() -> str:
    return '''<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments);};</script><script defer src="/_vercel/insights/script.js"></script><script defer src="/_vercel/speed-insights/script.js"></script><script defer src="/assets/analytics.js"></script>'''


def render_index(comics: list[dict]) -> str:
    latest = comics[0] if comics else None
    cards: list[str] = []
    for comic in comics:
        cover = f"/comics/{comic['slug']}/{comic['pages'][0]}" if comic.get("pages") else ""
        reader_href = f"/comics/{esc(comic['slug'])}/#read"
        pdf_href = f"/comics/{esc(comic['slug'])}/{esc(comic.get('pdf', ''))}" if comic.get("pdf") else ""
        pdf_button = f'<a class="mini-btn ghost" href="{pdf_href}">PDF</a>' if pdf_href else ""
        
        # New: Mortality Event Badge
        mortality_event = comic.get("mortality_event", "")
        mortality_badge = ""
        if mortality_event:
            mortality_badge = f'<div class="mortality-badge"><span class="badge-icon">⏳</span><span><em>{esc(mortality_event)}</em></span></div>'
            
        cards.append(
            '<article class="archive-card">'
            f'<a class="archive-cover" href="{reader_href}" aria-label="Read {esc(comic["person"])} fullscreen">'
            f'<img src="{esc(cover)}" alt="{esc(comic["person"])} comic cover" loading="lazy">'
            '</a>'
            '<div class="archive-copy">'
            f'<div class="meta">{esc(comic.get("published_at", ""))} · {esc(comic.get("years", ""))}</div>'
            f'<h3>{esc(comic["person"])}</h3>'
            f'<p>{esc(comic.get("dek", ""))}</p>'
            f'{mortality_badge}'
            '<div class="archive-actions">'
            f'<a class="mini-btn primary" href="{reader_href}">Read</a>'
            f'{pdf_button}'
            '</div></div></article>'
        )
    latest_button = ""
    if latest:
        latest_button = f'<a class="btn primary" href="/comics/{esc(latest["slug"])}/#read">Read latest</a>'
    archive = "".join(cards) if cards else '<div class="empty">No comics published yet.</div>'
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Memento Mori Obituary Comics</title><meta name="description" content="Daily obituary comics about people who faced death and made their work anyway."><link rel="stylesheet" href="/assets/style.css">{analytics_head()}</head><body data-page-type="archive"><div class="bg-particles" id="particles-js"></div><header class="hero"><div class="hero-content wrap"><div class="hourglass-loader" aria-hidden="true"></div><div class="kicker">Daily memento mori</div><h1>Obituary Comics</h1><p>Lives that met death early, then used borrowed time to make something that outlived them.</p><div class="rule-container"><div class="rule-line"></div><div class="rule-icon">⏳</div><div class="rule-line"></div></div><div class="quote-widget" id="quoteWidget" onclick="cycleQuote()"><p class="quote-text" id="quoteText">"You could leave life right now. Let that determine what you do and say and think."</p><p class="quote-author" id="quoteAuthor">Marcus Aurelius</p><div class="quote-tip">Reflect further</div></div><div class="btns">{latest_button}<a class="btn" href="#archive">Browse archive</a></div></div></header><main class="wrap section" id="archive"><div class="section-head"><div><div class="kicker">Small shelf, not doomscroll</div><h2>Archive</h2></div><p>Compact comic/PDF cards. Open a reader only when you choose it.</p></div><div class="archive-grid">{archive}</div></main><footer>Built for the morning death-reminder ritual. Clean comics, verified lives, no motivational slop.</footer><script>
const quotes = [
  {{ text: "You could leave life right now. Let that determine what you do and say and think.", author: "Marcus Aurelius" }},
  {{ text: "We are not given a short life but we make it short, and we are not ill-supplied but wasteful of it.", author: "Seneca" }},
  {{ text: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius" }},
  {{ text: "Remember that you are dying. Focus on what matters.", author: "Memento Mori" }},
  {{ text: "The reprieve was one moment. The work was the rest of their lives.", author: "Obituary Chronicles" }},
  {{ text: "They took my manuscript, my family, my health. The work is what remains.", author: "Viktor Frankl" }},
  {{ text: "I paint self-portraits because I am so often alone, because I am the person I know best.", author: "Frida Kahlo" }}
];
let quoteIdx = 0;
function cycleQuote() {{
  const textEl = document.getElementById('quoteText');
  const authEl = document.getElementById('quoteAuthor');
  if (!textEl || !authEl) return;
  quoteIdx = (quoteIdx + 1) % quotes.length;
  textEl.style.opacity = 0;
  setTimeout(() => {{
    textEl.textContent = `"${{quotes[quoteIdx].text}}"`;
    authEl.textContent = quotes[quoteIdx].author;
    textEl.style.opacity = 1;
  }}, 200);
}}
(function() {{
  const container = document.getElementById('particles-js');
  if (!container) return;
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let width = canvas.width = container.offsetWidth;
  let height = canvas.height = container.offsetHeight;
  window.addEventListener('resize', () => {{
    width = canvas.width = container.offsetWidth;
    height = canvas.height = container.offsetHeight;
  }});
  const particles = [];
  const particleCount = 45;
  for (let i = 0; i < particleCount; i++) {{
    particles.push({{
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      vy: Math.random() * 0.4 + 0.1,
      vx: Math.random() * 0.2 - 0.1
    }});
  }}
  function draw() {{
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(223, 177, 91, 0.22)';
    ctx.beginPath();
    for (let i = 0; i < particleCount; i++) {{
      const p = particles[i];
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
    }}
    ctx.fill();
    update();
  }}
  function update() {{
    for (let i = 0; i < particleCount; i++) {{
      const p = particles[i];
      p.y += p.vy;
      p.x += p.vx;
      if (p.y > height) {{
        particles[i] = {{
          x: Math.random() * width,
          y: -10,
          r: p.r,
          vy: p.vy,
          vx: p.vx
        }};
      }}
      if (p.x > width) p.x = 0;
      else if (p.x < 0) p.x = width;
    }}
  }}
  function loop() {{
    draw();
    requestAnimationFrame(loop);
  }}
  loop();
}})();
</script></body></html>'''


def render_comic(comic: dict, next_comic: dict | None = None) -> str:
    pages = "".join(
        f'<figure class="reader-page" id="page-{i:02d}"><img src="{esc(src)}" alt="Page {i} of {esc(comic["person"])}: {esc(comic["title"])}" loading="{"eager" if i == 1 else "lazy"}"><figcaption>Page {i:02d}</figcaption></figure>'
        for i, src in enumerate(comic.get("pages", []), 1)
    )
    sources_html = "".join(f'<span class="source-chip">{esc(s)}</span>' for s in comic.get("sources", []))
    pdf_button = f'<a class="reader-btn primary" href="{esc(comic["pdf"])}">PDF</a>' if comic.get("pdf") else ""
    contact_button = f'<a class="reader-btn" href="{esc(comic["contact_sheet"])}">Contact</a>' if comic.get("contact_sheet") else ""
    fullscreen_button = '<button class="reader-btn" id="fullscreenBtn" type="button">Fullscreen</button>'
    
    next_teaser = ""
    if next_comic:
        next_cover = f"/comics/{next_comic['slug']}/{next_comic['pages'][0]}" if next_comic.get("pages") else ""
        next_teaser = f'''
        <div class="next-comic-teaser">
          <div class="next-kicker">Up Next</div>
          <a href="/comics/{esc(next_comic['slug'])}/#read" class="next-comic-link">
            <div class="next-cover">
              <img src="{esc(next_cover)}" alt="{esc(next_comic['person'])} Cover" loading="lazy">
            </div>
            <div class="next-info">
              <h4>{esc(next_comic['person'])}</h4>
              <p>{esc(next_comic.get('dek', ''))}</p>
            </div>
          </a>
        </div>
        '''

    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>{esc(comic["person"])} — {esc(comic["title"])}</title><meta name="description" content="{esc(comic.get("dek", ""))}"><link rel="stylesheet" href="/assets/style.css">{analytics_head()}</head><body class="reader-mode" data-page-type="reader" data-comic-slug="{esc(comic['slug'])}" data-person="{esc(comic['person'])}" data-title="{esc(comic['title'])}"><nav class="reader-toolbar" aria-label="Reader controls" id="readerToolbar"><a class="reader-btn" href="/">← Archive</a><div class="reader-title">{esc(comic["person"])} · {esc(comic["title"])}</div><div class="reader-actions"><div class="option-group" aria-label="Theme selector"><button class="option-btn active" id="theme-btn-obsidian" onclick="setTheme('obsidian')" title="Obsidian Ashes theme">Obsidian</button><button class="option-btn" id="theme-btn-sepia" onclick="setTheme('sepia')" title="Sepia Dust theme">Sepia</button><button class="option-btn" id="theme-btn-stark" onclick="setTheme('stark')" title="Stark Grave theme">OLED</button></div><div class="option-group" aria-label="Layout selector"><button class="option-btn active" id="layout-btn-vertical" onclick="setLayout('vertical')" title="Continuous scroll layout">Scroll</button><button class="option-btn" id="layout-btn-spread" onclick="setLayout('spread')" title="Dual page spread layout">Book</button><button class="option-btn" id="layout-btn-slide" onclick="setLayout('slide')" title="Slideshow layout">Slide</button></div>{fullscreen_button}{pdf_button}{contact_button}</div></nav><div class="reader-progress-container"><div class="reader-progress-bar" id="readerProgressBar"></div></div><main id="read" class="reader-pages layout-vertical" aria-label="Fullscreen scrollable comic pages">{pages}</main><div class="slide-nav-overlay slide-nav-prev" id="slideNavPrev" onclick="navigateSlide(-1)" aria-label="Previous page">←</div><div class="slide-nav-overlay slide-nav-next" id="slideNavNext" onclick="navigateSlide(1)" aria-label="Next page">→</div><footer class="reader-footer"><div class="epilogue-card"><div class="epilogue-quote">“{esc(comic.get("closing_line", ""))}”</div><div class="epilogue-sources">{sources_html}</div></div>{next_teaser}</footer><script>(function(){{
const btn=document.getElementById('fullscreenBtn');
const root=document.documentElement;
function setState(){{document.body.classList.toggle('fullscreen-active',!!document.fullscreenElement)}}
if(btn&&document.fullscreenEnabled){{
  btn.addEventListener('click',async()=>{{
    try{{if(document.fullscreenElement){{await document.exitFullscreen();}}else{{await root.requestFullscreen();}}}}
    catch(e){{console.warn('fullscreen failed',e)}}
  }});
  document.addEventListener('fullscreenchange',setState);
}}else if(btn){{btn.style.display='none'}}
}})();

let lastScrollY = window.scrollY;
const toolbar = document.getElementById('readerToolbar');
window.addEventListener('scroll', () => {{
  if (!toolbar) return;
  const currentScrollY = window.scrollY;
  if (currentScrollY > 120 && currentScrollY > lastScrollY) {{
    toolbar.classList.add('toolbar-hidden');
  }} else {{
    toolbar.classList.remove('toolbar-hidden');
  }}
  lastScrollY = currentScrollY;
}}, {{ passive: true }});
window.addEventListener('mousemove', (e) => {{
  if (e.clientY < 40 && toolbar) {{
    toolbar.classList.remove('toolbar-hidden');
  }}
}});

function setTheme(theme) {{
  document.body.classList.remove('theme-sepia', 'theme-stark');
  if (theme === 'sepia') document.body.classList.add('theme-sepia');
  if (theme === 'stark') document.body.classList.add('theme-stark');
  document.querySelectorAll('[id^="theme-btn-"]').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`theme-btn-${{theme}}`);
  if (activeBtn) activeBtn.classList.add('active');
  localStorage.setItem('memento-theme', theme);
}}
const savedTheme = localStorage.getItem('memento-theme') || 'obsidian';
setTheme(savedTheme);

let currentSlideIdx = 0;
const pagesContainer = document.getElementById('read');
function setLayout(layout) {{
  if (!pagesContainer) return;
  pagesContainer.classList.remove('layout-vertical', 'layout-spread', 'layout-slide');
  pagesContainer.classList.add(`layout-${{layout}}`);
  document.querySelectorAll('[id^="layout-btn-"]').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`layout-btn-${{layout}}`);
  if (activeBtn) activeBtn.classList.add('active');
  const pages = pagesContainer.querySelectorAll('.reader-page');
  if (layout === 'slide') {{
    pages.forEach((p, idx) => {{
      if (idx === currentSlideIdx) p.classList.add('active');
      else p.classList.remove('active');
    }});
    updateProgress(currentSlideIdx + 1, pages.length);
  }} else {{
    pages.forEach(p => p.classList.remove('active'));
    updateProgressFromScroll();
  }}
  localStorage.setItem('memento-layout', layout);
}}
function navigateSlide(direction) {{
  if (!pagesContainer) return;
  const pages = pagesContainer.querySelectorAll('.reader-page');
  if (pages.length === 0) return;
  currentSlideIdx = (currentSlideIdx + direction + pages.length) % pages.length;
  pages.forEach((p, idx) => {{
    if (idx === currentSlideIdx) p.classList.add('active');
    else p.classList.remove('active');
  }});
  updateProgress(currentSlideIdx + 1, pages.length);
  window.scrollTo({{ top: 0, behavior: 'instant' }});
}}
document.addEventListener('keydown', (e) => {{
  if (!pagesContainer || !pagesContainer.classList.contains('layout-slide')) return;
  if (e.key === 'ArrowLeft') navigateSlide(-1);
  if (e.key === 'ArrowRight') navigateSlide(1);
}});

const progressBar = document.getElementById('readerProgressBar');
function updateProgress(current, total) {{
  if (!progressBar) return;
  const pct = Math.min(100, Math.max(0, (current / total) * 100));
  progressBar.style.width = `${{pct}}%`;
}}
function updateProgressFromScroll() {{
  if (!pagesContainer || pagesContainer.classList.contains('layout-slide')) return;
  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
  if (progressBar) progressBar.style.width = `${{pct}}%`;
}}
window.addEventListener('scroll', updateProgressFromScroll, {{ passive: true }});
window.addEventListener('resize', updateProgressFromScroll, {{ passive: true }});
const savedLayout = localStorage.getItem('memento-layout') || 'vertical';
setTimeout(() => {{
  setLayout(savedLayout);
}}, 20);
</script></body></html>'''



def find_optional(source: Path, patterns: list[str]) -> Path | None:
    for pattern in patterns:
        hits = sorted(source.glob(pattern))
        if hits:
            return hits[0]
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir")
    parser.add_argument("--slug")
    parser.add_argument("--person", required=True)
    parser.add_argument("--title", default="Borrowed Time")
    parser.add_argument("--years", default="")
    parser.add_argument("--dek", default="")
    parser.add_argument("--event", default="")
    parser.add_argument("--sources", default="")
    parser.add_argument("--closing-line", default="The reprieve was one moment. The work was the rest of his life.")
    args = parser.parse_args()

    source = Path(args.source_dir).expanduser().resolve()
    if not source.exists():
        raise SystemExit(f"source not found: {source}")

    slug = args.slug or slugify(f"{args.person}-{args.title}")
    dest = ROOT / "comics" / slug
    (dest / "pages").mkdir(parents=True, exist_ok=True)

    page_sources = sorted((source / "pages").glob("*.jpg")) or sorted(source.glob("page*.jpg")) or sorted(source.glob("*.jpg"))
    if not page_sources:
        raise SystemExit("no page JPGs found in source_dir/pages or source_dir")

    pages: list[str] = []
    for index, page in enumerate(page_sources, 1):
        name = f"{index:02d}-{slug}.jpg"
        shutil.copy2(page, dest / "pages" / name)
        pages.append(f"pages/{name}")

    pdf = find_optional(source, ["*.pdf", "**/*.pdf"])
    pdf_name = None
    if pdf:
        pdf_name = f"{slug}.pdf"
        shutil.copy2(pdf, dest / pdf_name)

    contact = find_optional(source, ["*contact*.jpg", "*contact*.png", "**/*contact*.jpg", "**/*contact*.png"])
    contact_name = None
    if contact:
        contact_name = "contact-sheet" + contact.suffix.lower()
        shutil.copy2(contact, dest / contact_name)

    comic = {
        "slug": slug,
        "title": args.title,
        "person": args.person,
        "years": args.years,
        "dek": args.dek,
        "mortality_event": args.event,
        "published_at": dt.date.today().isoformat(),
        "pages": pages,
        "pdf": pdf_name,
        "contact_sheet": contact_name,
        "sources": [s.strip() for s in re.split(r";|,", args.sources) if s.strip()],
        "closing_line": args.closing_line,
    }

    comics = [item for item in load_comics() if item.get("slug") != slug]
    comics.insert(0, comic)
    save_comics(comics)

    next_comic = None
    if len(comics) > 1:
        try:
            curr_idx = [c["slug"] for c in comics].index(slug)
            next_idx = (curr_idx + 1) % len(comics)
            next_comic = comics[next_idx]
        except ValueError:
            next_comic = comics[0]

    (dest / "comic.json").write_text(json.dumps(comic, indent=2, ensure_ascii=False), encoding="utf-8")
    (dest / "index.html").write_text(render_comic(comic, next_comic), encoding="utf-8")
    (ROOT / "index.html").write_text(render_index(comics), encoding="utf-8")

    print(f"/comics/{slug}/")


if __name__ == "__main__":
    main()
