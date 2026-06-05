# Charted Roots PR: FinalNotes Obituary Research Guide

Date opened: 2026-06-05
Status: ready-for-review PR opened, not accepted until merged

## PR

- Upstream: https://github.com/banisterious/obsidian-charted-roots
- PR: https://github.com/banisterious/obsidian-charted-roots/pull/679
- Fork branch: `megabyte0x:codex/add-finalnotes-obituary-research-guide`
- Base branch: `main`
- Commit: `964f4f839a2aa14b4458fb7b57eccc0dcb1a88e0`

## FinalNotes Target

https://www.finalnotes.page/obituary-research-guide/

## Change

Added a short note to `wiki-content/Data-Entry.md` under `Clipping from Web Sources`, linking the FinalNotes Obituary Research Guide as an obituary-specific checklist for extracting names, dates, relationships, service details, and follow-up searches before promoting clipped data into a main Charted Roots tree.

## Fit Rationale

Charted Roots is an active Obsidian genealogy plugin. Its data-entry docs already recommend using Obsidian Web Clipper for online sources including obituaries, Find A Grave, FamilySearch, and historical archives. The FinalNotes guide fits as a practical obituary extraction checklist at the exact point where users are deciding how to capture obituary data.

## Verification

- `git diff --check` passed in the external checkout.
- `https://www.finalnotes.page/obituary-research-guide/` returned `HTTP/2 200`.
- `https://github.com/banisterious/obsidian-charted-roots/pull/679` returned `HTTP/2 200`.
- PR metadata confirmed open, non-draft, mergeable, unmerged, one changed file, and two insertions.
- JS tests were not run because the temporary docs-only checkout had no installed dependencies.

## Completion Caveat

This is a proposed public backlink path only. It becomes an accepted/live backlink only if the maintainer merges the PR and the resulting GitHub/wiki page is indexed.
