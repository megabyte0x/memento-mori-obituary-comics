import assert from "node:assert/strict";
import test from "node:test";

import { storyNotes } from "../lib/comic-presenters.js";

test("generated story notes remain grammatical with sentence-shaped source fields", () => {
  const notes = storyNotes({
    person: "Ada Lovelace",
    dek: "The young mathematician who imagined a programmable future.",
    mortality_event: "Ada Lovelace died of uterine cancer at age 36.",
    sources: [{ name: "Biography", url: "https://example.com/biography" }],
  });

  assert.equal(notes[0], "This comic follows Ada Lovelace, the young mathematician who imagined a programmable future.");
  assert.equal(
    notes[1],
    "The comic documents this mortality turning point: Ada Lovelace died of uterine cancer at age 36. It treats that encounter with death as the pressure point for the work that followed.",
  );
});
