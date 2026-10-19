import { upcomingAnniversaries } from "../../lib/anniversaries.js";
import { loadRuntimeComics } from "../../lib/runtime-comics.js";
import { absoluteUrl } from "../../lib/site.js";

export const dynamic = "force-dynamic";

// Upcoming birth and death anniversaries of published subjects, used by the
// publishing agent to schedule re-shares and refresh pages before search spikes.
export async function GET(request) {
  const requested = Number(new URL(request.url).searchParams.get("days") || 30);
  const days = Number.isFinite(requested) ? Math.min(Math.max(Math.round(requested), 0), 366) : 30;
  const items = upcomingAnniversaries(await loadRuntimeComics(), { days }).map((item) => ({
    slug: item.comic.slug,
    person: item.comic.person,
    kind: item.kind,
    date: item.date,
    days_away: item.daysAway,
    years: item.years,
    url: absoluteUrl(`/comics/${item.comic.slug}/`),
  }));
  return Response.json({ days, items }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
