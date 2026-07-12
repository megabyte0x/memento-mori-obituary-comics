import assert from "node:assert/strict";
import test from "node:test";

import { canonicalUrlFor } from "../lib/canonical-host.js";

test("apex requests permanently redirect to the canonical www host", () => {
  assert.equal(
    canonicalUrlFor(new URL("https://finalnotes.page/comics/audre-lorde-cancer-journals/?ref=apex")).href,
    "https://www.finalnotes.page/comics/audre-lorde-cancer-journals/?ref=apex",
  );
});

test("www requests are not redirected", () => {
  assert.equal(canonicalUrlFor(new URL("https://www.finalnotes.page/about/")), null);
});
