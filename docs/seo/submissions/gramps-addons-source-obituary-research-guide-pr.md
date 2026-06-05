# Gramps WebSearch Addon PR: FinalNotes Obituary Research Guide

Date opened: 2026-06-05
Status: ready-for-review PR opened, not accepted until merged

## PR

- Upstream: https://github.com/gramps-project/addons-source
- PR: https://github.com/gramps-project/addons-source/pull/940
- Fork branch: `megabyte0x:codex/add-finalnotes-obituary-research-guide`
- Base branch: `maintenance/gramps61`
- Commit: `e51c5203330115855a6198a6a5139cb09c1b68d7`

## FinalNotes Target

https://www.finalnotes.page/obituary-research-guide/

## Change

Added `FinalNotes Obituary Research Guide` to `WebSearch/assets/csv/static-links.csv` as an enabled `People` static link for Gramps WebSearch users.

## Fit Rationale

The Gramps WebSearch addon is a genealogy-specific surface for research links. The FinalNotes obituary research guide is relevant to genealogy users who are collecting obituary records and turning those records into sourced life-story notes.

## Verification

- `git diff --check` passed in the external Gramps checkout.
- `csv.DictReader` parsed `WebSearch/assets/csv/static-links.csv` and confirmed the added title and URL.
- `https://www.finalnotes.page/obituary-research-guide/` returned `HTTP/2 200`.
- `https://github.com/gramps-project/addons-source/pull/940` returned `HTTP/2 200`.
- PR metadata confirmed open, non-draft, mergeable, unmerged, one changed file, and one insertion.

## Completion Caveat

This is a proposed public backlink path only. It becomes an accepted/live backlink only if the Gramps maintainers merge the PR and the resulting GitHub/Gramps surfaces are indexed.
