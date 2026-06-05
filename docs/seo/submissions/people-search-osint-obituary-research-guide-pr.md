# People Search OSINT Obituary Research Guide PR

Status: ready-for-review PR opened; not merged or accepted yet
Target repository: https://github.com/The-Osint-Toolbox/People-Search-OSINT
Pull request: https://github.com/The-Osint-Toolbox/People-Search-OSINT/pull/1
Fork branch: `megabyte0x:codex/add-finalnotes-obituary-research-guide`
Commit: `3a3fb4c81aa77657fe34ad9fcb345c06ae89619f`
FinalNotes URL: https://www.finalnotes.page/obituary-research-guide/

## Why This Qualifies

`The-Osint-Toolbox/People-Search-OSINT` is a public people-search resource list with a UK focus and broader people-search resources. It already includes `Family Search` as a family-history resource.

The FinalNotes obituary research guide fits as an adjacent family-history and people-search workflow because it helps researchers find obituary records, preserve source trails, and use obituary clues in sourced family-history research.

## README Addition

```html
<li><a href="https://www.finalnotes.page/obituary-research-guide/">FinalNotes Obituary Research Guide</a></li>
  <p>Guide for finding obituary records, preserving source trails, and using obituary clues in sourced family-history research.</p>
```

## Verification

- GitHub PR metadata confirmed PR `#1` is open, ready for review, and mergeable.
- The PR page returned `HTTP/2 200`.
- Local `git show` confirms the README adds the FinalNotes obituary research guide link after `Family Search`.
- `https://www.finalnotes.page/obituary-research-guide/` returned `HTTP/2 200`.
- `git diff --check` passed in the temporary external clone.

## Follow-Up

- Do not count this as an accepted backlink until the PR is reviewed and merged.
- If merged, record the live README URL in `docs/seo/backlink-outreach-tracker.md` with the anchor `FinalNotes Obituary Research Guide`.
- If rejected, record the reason and do not reopen unless the maintainer asks for a revised description.
