import enrichment from "../data/comic-enrichment.json" with { type: "json" };
import readerText from "../data/comic-reader-text.json" with { type: "json" };

// Checked-in data for comics published before the agent emitted these fields:
// entity data (Wikidata ID, exact life dates, themes) and reader text (page
// transcripts, FAQ). Values authored in the catalogue always win; these files
// only fill gaps.
export function applyEnrichment(comics, data = enrichment, text = readerText) {
  return comics.map((comic) => {
    const extra = data[comic.slug];
    const words = text[comic.slug];
    if (!extra && !words) return comic;
    const merged = { ...comic };
    if (extra) {
      for (const key of ["birth_date", "death_date", "wikidata"]) {
        if (!merged[key] && extra[key]) merged[key] = extra[key];
      }
      if (!(Array.isArray(merged.themes) && merged.themes.length) && Array.isArray(extra.themes)) merged.themes = extra.themes;
      if (extra.wikidata) {
        const sameAs = Array.isArray(merged.sameAs) ? merged.sameAs : [];
        if (!sameAs.some((url) => /wikidata\.org/.test(url))) merged.sameAs = [...sameAs, extra.wikidata];
      }
    }
    if (words) {
      // Transcripts are positional; skip them if the comic's pages changed since they were written.
      const pageCount = merged.pages?.length || 0;
      if (!merged.page_transcripts?.length && words.page_transcripts?.length === pageCount) merged.page_transcripts = words.page_transcripts;
      if (!merged.faq?.length && words.faq?.length) merged.faq = words.faq;
    }
    return merged;
  });
}
