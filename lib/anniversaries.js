const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86400000;

function utcDay(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

// Next occurrence (today or later) of a month/day, in UTC. Feb 29 falls on Mar 1
// in common years.
function nextOccurrence(month, day, today) {
  const year = today.getUTCFullYear();
  for (const candidateYear of [year, year + 1]) {
    const candidate = new Date(Date.UTC(candidateYear, month - 1, day));
    if (candidate.getTime() >= utcDay(today)) return candidate;
  }
  return null;
}

export function upcomingAnniversaries(comics, { today = new Date(), days = 30 } = {}) {
  const items = [];
  for (const comic of comics || []) {
    for (const [kind, value] of [["birth", comic.birth_date], ["death", comic.death_date]]) {
      const match = String(value || "").match(ISO_DAY);
      if (!match) continue;
      const [, year, month, day] = match.map(Number);
      const date = nextOccurrence(month, day, today);
      if (!date) continue;
      const daysAway = Math.round((date.getTime() - utcDay(today)) / DAY_MS);
      if (daysAway > days) continue;
      items.push({
        comic,
        kind,
        date: date.toISOString().slice(0, 10),
        daysAway,
        years: date.getUTCFullYear() - year,
      });
    }
  }
  return items.sort((a, b) => a.daysAway - b.daysAway || a.comic.person.localeCompare(b.comic.person));
}

export function ordinal(value) {
  const n = Math.abs(Number(value));
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th";
  return `${value}${suffix}`;
}

export function anniversaryLabel(item) {
  const what = item.kind === "birth" ? "birth" : "death";
  const when = item.daysAway === 0 ? "today" : item.daysAway === 1 ? "tomorrow" : `in ${item.daysAway} days`;
  return `${ordinal(item.years)} anniversary of ${item.comic.person}’s ${what} · ${when}`;
}
