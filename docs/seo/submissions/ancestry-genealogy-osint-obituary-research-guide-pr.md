# Ancestry Genealogy OSINT Obituary Research Guide PR

Status: ready-for-review PR opened; not merged or accepted yet
Target repository: https://github.com/The-Osint-Toolbox/Ancestry-Genealogy-OSINT
Pull request: https://github.com/The-Osint-Toolbox/Ancestry-Genealogy-OSINT/pull/1
Fork branch: `megabyte0x:codex/add-finalnotes-obituary-research-guide`
Commit: `376627a5202b4d8b0e2f192dc6ac10a795e50cdc`
FinalNotes URL: https://www.finalnotes.page/obituary-research-guide/

## Why This Qualifies

`The-Osint-Toolbox/Ancestry-Genealogy-OSINT` is a public ancestry, genealogy, and historical-records resource list. It includes death and record-search resources such as British Newspaper Archive, Deceased Online, FreeBMD, FreeCEN, FreeREG, UK Census, and The National Archives.

The FinalNotes obituary research guide fits as a supplemental obituary-record resource because it helps researchers find obituary records, preserve source trails, and turn obituary clues into sourced family-history stories.

## README Addition

```html
<li><a href="https://www.finalnotes.page/obituary-research-guide/">FinalNotes Obituary Research Guide</a></li>
 <p>A practical guide to finding obituary records, preserving source trails, and turning obituary clues into sourced family-history stories.</p>
```

## Verification

- GitHub PR metadata confirmed PR `#1` is open, ready for review, and mergeable.
- The PR page returned `HTTP/2 200`.
- Local `git show` confirms the README adds the FinalNotes obituary research guide link.
- `https://www.finalnotes.page/obituary-research-guide/` returned `HTTP/2 200`.
- `git diff --check` passed in the temporary external clone.

## Follow-Up

- Do not count this as an accepted backlink until the PR is reviewed and merged.
- If merged, record the live README URL in `docs/seo/backlink-outreach-tracker.md` with the anchor `FinalNotes Obituary Research Guide`.
- If rejected, record the reason and do not reopen unless the maintainer asks for a revised description.
