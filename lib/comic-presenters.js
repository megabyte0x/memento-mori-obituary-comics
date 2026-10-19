import { comicMediaPath } from "./media-paths.js";

export function mediaPath(comic, src = "") {
  return comicMediaPath(comic, src);
}

export function firstImagePath(comic) {
  const first = comic?.pages?.[0];
  return first ? mediaPath(comic, first) : "";
}

export function imageSize(comic, src) {
  const value = comic?.page_dimensions?.[src];
  return Array.isArray(value) && value.length === 2 ? { width: value[0], height: value[1] } : {};
}

function splitSourceLabelAndUrl(name = "", url = "") {
  const rawName = String(name || "").trim();
  const rawUrl = String(url || "").trim();
  const embeddedUrlMatch = rawName.match(/(https?:\/\/\S+)/i);

  if (embeddedUrlMatch) {
    const embeddedUrl = embeddedUrlMatch[1].replace(/[),.;]+$/, "");
    const label = rawName
      .slice(0, embeddedUrlMatch.index)
      .replace(/[:\-–\s]+$/, "")
      .trim();

    return {
      name: label || rawUrl || embeddedUrl,
      url: rawUrl || embeddedUrl,
    };
  }

  return {
    name: rawName || rawUrl,
    url: rawUrl,
  };
}

export function sourceItems(comic) {
  return (comic.sources || [])
    .map((source) => {
      if (typeof source === "string") return splitSourceLabelAndUrl(source, "");
      return splitSourceLabelAndUrl(source.name || "", source.url || "");
    })
    .filter((source) => source.name);
}

export function sourceNames(comic) {
  return sourceItems(comic).map((source) => source.name).join("; ");
}

export function compactText(value, limit) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 3)).replace(/[ ,;.]+$/, "")}...`;
}

export function comicDescription(comic) {
  const dek = (comic.dek || "").replace(/\.$/, "");
  const event = (comic.mortality_event || "").replace(/\.$/, "");
  return event ? `${dek}. A memento mori obituary comic centered on ${event}.` : `${dek}. A memento mori obituary comic.`;
}

export function citationPassage(comic) {
  return String(comic?.citation_passage || "").replace(/\s+/g, " ").trim();
}

export function citableSummary(comic) {
  if (comic.citable_summary?.length) return comic.citable_summary;
  return [
    `${comic.person} (${comic.years || ""}) is featured in an obituary comic about mortality, work, and what remains.`,
    comic.mortality_event ? `The comic centers on this mortality event: ${comic.mortality_event}` : comic.dek,
    `The reader version includes image pages, a PDF, and sources including ${sourceNames(comic)}.`,
  ];
}

function lowercaseSentenceStart(value = "") {
  const sentence = String(value).replace(/\.$/, "").trim();
  return sentence ? `${sentence[0].toLocaleLowerCase()}${sentence.slice(1)}` : "";
}

export function storyNotes(comic) {
  if (comic.story_notes?.length) return comic.story_notes;
  const dek = lowercaseSentenceStart(comic.dek);
  return [
    dek ? `This comic follows ${comic.person}, ${dek}.` : `This comic follows ${comic.person}.`,
    comic.mortality_event
      ? `The comic documents this mortality turning point: ${comic.mortality_event.replace(/\.$/, "")}. It treats that encounter with death as the pressure point for the work that followed.`
      : "",
    `The source trail for this page includes ${sourceNames(comic)}.`,
  ].filter(Boolean);
}

export function pageSummary(comic, index) {
  return comic.page_summaries?.[index - 1] || "";
}

export function pageTranscript(comic, index) {
  return String(comic.page_transcripts?.[index - 1] || "").trim();
}

export function storyTitle(comic) {
  const person = String(comic?.person || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return String(comic?.title || "").replace(new RegExp(`^${person}\\s*:\\s*`, "i"), "").trim();
}

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatLifeDate(value = "") {
  const match = String(value).match(ISO_DAY);
  if (!match) return "";
  return `${MONTHS[Number(match[2]) - 1]} ${Number(match[3])}, ${Number(match[1])}`;
}

export function ageAtDeath(birthDate = "", deathDate = "") {
  const birth = String(birthDate).match(ISO_DAY);
  const death = String(deathDate).match(ISO_DAY);
  if (!birth || !death) return null;
  const [, by, bm, bd] = birth.map(Number);
  const [, dy, dm, dd] = death.map(Number);
  const age = dy - by - (dm < bm || (dm === bm && dd < bd) ? 1 : 0);
  return age >= 0 ? age : null;
}

export function lifeFacts(comic) {
  const born = formatLifeDate(comic.birth_date);
  const died = formatLifeDate(comic.death_date);
  return {
    born,
    died,
    age: ageAtDeath(comic.birth_date, comic.death_date),
    years: String(comic.years || "").trim(),
  };
}

// Authored FAQ entries come from the publishing agent. Without them, only
// questions answerable from structured, sourced fields are generated.
export function comicFaq(comic) {
  const authored = (Array.isArray(comic.faq) ? comic.faq : [])
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
      ...(/^https:\/\//.test(String(item?.source_url || "")) ? { sourceUrl: String(item.source_url) } : {}),
    }))
    .filter((item) => item.question && item.answer);
  if (authored.length) return authored;

  const { died, age, born } = lifeFacts(comic);
  const derived = [];
  if (died) {
    const agePart = age !== null ? `, at the age of ${age}` : "";
    const bornPart = born ? ` ${comic.person} was born on ${born}.` : "";
    derived.push({
      question: `When did ${comic.person} die?`,
      answer: `${comic.person} died on ${died}${agePart}.${bornPart}`,
    });
  }
  const event = String(comic.mortality_event || "").trim();
  if (event) {
    const pages = comic.pages?.length || 0;
    derived.push({
      question: `What does the ${comic.person} comic cover?`,
      answer: `${pages ? `This ${pages}-page illustrated biography` : "This illustrated biography"} centers on one turning point: ${event.replace(/\.$/, "")}.`,
    });
  }
  return derived;
}
