# Commons OS Obituary Writing Practice PR

Date opened: 2026-06-05

PR: https://github.com/Commons-OS/patterns/pull/6

Fork branch: `megabyte0x:codex/add-finalnotes-obituary-story-form`

Target file: `_patterns/obituary-writing-practice.md`

FinalNotes targets:

- https://www.finalnotes.page/obituary-stories/
- https://www.finalnotes.page/obituary-articles/

## Fit

Commons OS has an active public `Obituary Writing Practice` pattern that already teaches obituary writing as a values and legacy reflection practice. The edit adds one implementation note for readers who want to turn the first draft into a public remembrance form.

The added paragraph distinguishes private reflection, family life story, reported article, eulogy, and short death notice usage. The FinalNotes obituary-stories and obituary-articles guides are framed as checkpoints for choosing the right form after the first draft, not as a generic resource-list insertion.

## Verification

- Repository metadata checked on 2026-06-05: `Commons-OS/patterns` is public, active, unarchived, default branch `main`, and last pushed 2026-05-31.
- PR metadata after opening: `state: open`, `draft: false`, `mergeable: true`, `mergeable_state: unstable`, `merged: false`, one commit, one changed file, three additions, zero deletions.
- PR page returned `HTTP/2 200`.
- `https://www.finalnotes.page/obituary-stories/` returned `HTTP/2 200`.
- `https://www.finalnotes.page/obituary-articles/` returned `HTTP/2 200`.
- Local Ruby/Psych parsing confirmed the edited frontmatter loads and includes the new FinalNotes source.

## Status

Proposed only. This is not an accepted backlink until the maintainer merges the PR and the rendered pattern page includes the links.
