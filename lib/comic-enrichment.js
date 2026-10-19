import enrichment from "../data/comic-enrichment.json" with { type: "json" };

// Checked-in entity data (Wikidata ID, exact life dates, themes) for comics
// published before the agent emitted these fields. Values authored in the
// catalogue always win; this file only fills gaps.
export function applyEnrichment(comics, data = enrichment) {
  return comics.map((comic) => {
    const extra = data[comic.slug];
    if (!extra) return comic;
    const merged = { ...comic };
    for (const key of ["birth_date", "death_date", "wikidata"]) {
      if (!merged[key] && extra[key]) merged[key] = extra[key];
    }
    if (!(Array.isArray(merged.themes) && merged.themes.length) && Array.isArray(extra.themes)) merged.themes = extra.themes;
    if (extra.wikidata) {
      const sameAs = Array.isArray(merged.sameAs) ? merged.sameAs : [];
      if (!sameAs.some((url) => /wikidata\.org/.test(url))) merged.sameAs = [...sameAs, extra.wikidata];
    }
    return merged;
  });
}
