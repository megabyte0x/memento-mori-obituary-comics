// Theme hubs group comics by what the subject faced or what they made.
// Each comic lists theme slugs in `themes`; the first one is its primary theme
// and drives the reader breadcrumb.

export const THEMES = [
  {
    slug: "cancer",
    name: "Cancer",
    title: "Famous People Who Kept Working Through Cancer",
    description: "Illustrated biographies of writers, scientists, musicians, and athletes who kept making work after a cancer diagnosis, with sources for each life.",
    intro: [
      "A cancer diagnosis often arrives as a deadline. The people in these comics answered it differently: a neurosurgeon wrote a memoir about the time he had left, a runner set out across Canada on one leg, a poet refused to keep her illness private, and a songwriter turned his final months into an album.",
      "Each comic is an illustrated, source-backed biography that follows the diagnosis, the work made afterward, and what that work still does for readers today. Dates and medical details come from the cited sources on each page.",
    ],
  },
  {
    slug: "illness",
    name: "Serious illness",
    title: "Famous People Who Lived and Worked With Serious Illness",
    description: "Illustrated life stories of people who created major work while living with tuberculosis, lupus, AIDS, mental illness, epidemics, and other serious illness.",
    intro: [
      "Before modern medicine, many of the people remembered for their work lived with chronic illness that was expected to kill them early. Others faced epidemics, mental illness, or diseases that carried stigma as well as danger.",
      "These comics follow how illness shaped what they made: paintings finished between hospital stays, novels written against failing lungs, and public campaigns that changed how a disease was treated. Each biography lists the sources behind it.",
    ],
  },
  {
    slug: "blindness",
    name: "Blindness and sight loss",
    title: "Famous Blind People and Those Who Lost Their Sight",
    description: "Illustrated biographies of famous blind people and people who lost their sight, from Helen Keller and Louis Braille to John Milton and Claude Monet.",
    intro: [
      "Some of the people here were blind from childhood; others lost their sight in the middle of a working life. A boy blinded by an awl invented the reading system used around the world, a poet dictated an epic after his sight failed, and a painter of light kept working through cataracts.",
      "Each comic tells the story of how sight loss changed the work rather than ending it, with sources linked on every page.",
    ],
  },
  {
    slug: "disability",
    name: "Disability",
    title: "Famous People With Disabilities Who Changed Their Fields",
    description: "Illustrated biographies of famous people with disabilities, including Stephen Hawking, Christopher Reeve, Frida Kahlo, Beethoven, and Judy Heumann.",
    intro: [
      "Paralysis, amputation, deafness, polio, and injury appear in these lives as facts the subjects had to work with, not as the whole story. A physicist explained the universe through a speech synthesiser, a guitarist rebuilt his technique around two working fingers, and an organiser turned exclusion from school into national disability-rights law.",
      "Each comic is a short, source-backed visual biography focused on the work each person made and the barriers they changed for others.",
    ],
  },
  {
    slug: "holocaust",
    name: "The Holocaust",
    title: "Holocaust Survivors, Rescuers, and Witnesses",
    description: "Illustrated biographies of Holocaust survivors, rescuers, and witnesses, including Primo Levi, Elie Wiesel, Viktor Frankl, Irena Sendler, and Corrie ten Boom.",
    intro: [
      "These comics follow people who survived the camps, rescued others from them, or recorded what was happening while it happened. Several wrote the books that still shape how the Holocaust is taught; others hid children, smuggled reports out of Auschwitz, or kept diaries that became evidence.",
      "Each illustrated biography is built from published testimony, museum records, and encyclopedic sources, linked on every page. They are suitable starting points for students and readers new to these lives.",
    ],
  },
  {
    slug: "prison",
    name: "Prison and captivity",
    title: "Famous Prisoners Who Wrote and Created in Captivity",
    description: "Illustrated biographies of people who created lasting work in prison, the Gulag, or as prisoners of war, from Cervantes and Dostoyevsky to Solzhenitsyn and Havel.",
    intro: [
      "Prison cells, labour camps, and prisoner-of-war camps produced some of the most influential writing of the last five centuries. A captured soldier went on to write Don Quixote, a philosopher filled notebooks under Fascist guard, and a dissident playwright left prison to become president.",
      "These comics trace how captivity shaped each person's work and what they did once they were free, with sources on every page.",
    ],
  },
  {
    slug: "war",
    name: "War",
    title: "War Survivors, Resisters, and Wartime Heroes",
    description: "Illustrated biographies of war survivors, resistance members, nurses, and pilots, including Tolkien, Virginia Hall, Florence Nightingale, and Louis Zamperini.",
    intro: [
      "War put the people in these comics close to death, sometimes for years. Some fought, some nursed the wounded, some ran escape lines or spy networks, and some survived bombings that killed almost everyone around them.",
      "Each biography follows what the person carried out of the war and made from it: books, humanitarian organisations, testimony, and quieter acts of refusal. Every page lists its sources.",
    ],
  },
  {
    slug: "artists",
    name: "Artists",
    title: "Artists Who Painted Through Illness, War, and Loss",
    description: "Illustrated biographies of painters, photographers, and filmmakers such as Van Gogh, Frida Kahlo, Matisse, and Monet whose work was shaped by mortality.",
    intro: [
      "Painters, photographers, and filmmakers appear here at the moment their work changed because their circumstances did. Van Gogh painted his best-known canvases while moving in and out of hospital, Matisse turned to cut paper after surgery, and Frida Kahlo made her injured body the subject of modern art.",
      "Each comic is a short visual biography with sources, written for readers who want the story behind the work.",
    ],
  },
  {
    slug: "writers",
    name: "Writers",
    title: "Writers Who Faced Death and Kept Writing",
    description: "Illustrated biographies of novelists, poets, journalists, and memoirists, from Dostoyevsky and Orwell to Maya Angelou and Primo Levi, whose writing was shaped by mortality.",
    intro: [
      "Many of the most read books of the last two centuries were written by people who had come close to dying: a novelist reprieved in front of a firing squad, an essayist shot through the throat, a poet who stopped speaking for years, a memoirist who dictated a book by blinking.",
      "These comics follow each writer's encounter with death and the books that came after it, with sources linked on every page.",
    ],
  },
  {
    slug: "musicians",
    name: "Musicians",
    title: "Musicians Who Made Music Against Illness and Loss",
    description: "Illustrated biographies of musicians including Beethoven, Freddie Mercury, David Bowie, Django Reinhardt, and Tina Turner, and the music they made under pressure.",
    intro: [
      "A composer who could no longer hear, a guitarist with a burned hand, and singers who recorded while seriously ill all appear in these comics. Their late work is often the music people know best.",
      "Each illustrated biography follows the circumstances behind that music, with linked sources.",
    ],
  },
  {
    slug: "scientists",
    name: "Scientists and inventors",
    title: "Scientists, Doctors, and Inventors Who Raced Against Time",
    description: "Illustrated biographies of scientists, mathematicians, doctors, and inventors such as Stephen Hawking, Ada Lovelace, Ramanujan, and Alan Turing.",
    intro: [
      "Mathematicians working against terminal illness, doctors who studied their own diagnoses, and inventors whose work outlived them by generations are collected here. Several did their most important work in the years they were told they did not have.",
      "Each comic explains the science or invention in plain language alongside the life story, with sources on every page.",
    ],
  },
  {
    slug: "civil-rights",
    name: "Civil rights",
    title: "Civil Rights Leaders and Freedom Fighters",
    description: "Illustrated biographies of civil rights leaders and freedom fighters, including Harriet Tubman, Frederick Douglass, John Lewis, and Judy Heumann.",
    intro: [
      "The people in these comics risked their lives, and sometimes lost their health, to win rights for others: escaping slavery and going back, marching into violence, or occupying federal buildings until a law was enforced.",
      "Each biography follows the moment of danger and the change that followed it, with linked sources suitable for classroom use.",
    ],
  },
  {
    slug: "athletes-explorers",
    name: "Athletes and explorers",
    title: "Athletes, Explorers, and Aviators Who Survived the Edge",
    description: "Illustrated biographies of athletes, explorers, and aviators like Terry Fox, Wilma Rudolph, Ernest Shackleton, and Junko Tabei who came back from the edge.",
    intro: [
      "Polar ice, avalanches, ocean crashes, polio, and cancer all appear in these stories of people whose bodies were their work. Some came back to set records; others turned an unfinished journey into a movement.",
      "Each comic follows the expedition, race, or flight and what it meant afterward, with sources on every page.",
    ],
  },
  {
    slug: "faith",
    name: "Faith",
    title: "Faith, Doubt, and Mortality: Religious Thinkers and Believers",
    description: "Illustrated biographies of religious thinkers and believers including Dietrich Bonhoeffer, Corrie ten Boom, Blaise Pascal, and Hildegard of Bingen.",
    intro: [
      "For the people in these comics, facing death was also a religious question. A pastor wrote letters from a Nazi prison, a watchmaker's family hid refugees, a mathematician sewed an account of a night of revelation into his coat, and a medieval abbess turned illness into visions and music.",
      "Each biography stays with the historical record, citing its sources, rather than arguing for or against belief.",
    ],
  },
  {
    slug: "women",
    name: "Women in history",
    title: "Women Who Changed History After Facing Death",
    description: "Illustrated biographies of women in history, including Harriet Tubman, Frida Kahlo, Ada Lovelace, Helen Keller, and Irena Sendler, with sources for each life.",
    intro: [
      "These comics collect women whose work was shaped by illness, war, prison, or loss: spies and rescuers, scientists and doctors, poets and painters, athletes and activists. Many were dismissed in their own lifetimes and are better known now.",
      "Each illustrated biography is short enough to read in a few minutes and lists the sources it was built from, making the set useful for Women's History Month and classroom reading.",
    ],
  },
];

const BY_SLUG = new Map(THEMES.map((theme) => [theme.slug, theme]));

export function getTheme(slug) {
  return BY_SLUG.get(slug) || null;
}

export function themePath(theme) {
  return `/themes/${typeof theme === "string" ? theme : theme.slug}/`;
}

export function comicThemes(comic) {
  return (Array.isArray(comic?.themes) ? comic.themes : []).map(getTheme).filter(Boolean);
}

export function primaryTheme(comic) {
  return comicThemes(comic)[0] || null;
}

export function comicsForTheme(comics, slug) {
  return (comics || []).filter((comic) => Array.isArray(comic.themes) && comic.themes.includes(slug));
}

export function themesWithComics(comics) {
  return THEMES.map((theme) => ({ theme, comics: comicsForTheme(comics, theme.slug) })).filter((entry) => entry.comics.length);
}

// Related comics share the most themes, with matching primary themes first.
export function relatedComics(comics, comic, limit = 6) {
  const themes = new Set(comic?.themes || []);
  const primary = comic?.themes?.[0];
  return (comics || [])
    .filter((other) => other.slug !== comic.slug)
    .map((other) => {
      const shared = (other.themes || []).filter((slug) => themes.has(slug)).length;
      return { other, score: shared * 2 + (primary && other.themes?.includes(primary) ? 1 : 0) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || String(b.other.published_at).localeCompare(String(a.other.published_at)))
    .slice(0, limit)
    .map((entry) => entry.other);
}
