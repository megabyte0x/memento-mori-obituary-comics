# Autoresearch Genealogy PR: FinalNotes Obituary Research Guide

Date opened: 2026-06-05
Status: ready-for-review PR opened, not accepted until merged

## PR

- Upstream: https://github.com/mattprusak/autoresearch-genealogy
- PR: https://github.com/mattprusak/autoresearch-genealogy/pull/12
- Fork branch: `megabyte0x:codex/add-finalnotes-obituary-research-guide`
- Base branch: `main`
- Commit: `12308f92ce5b45a16cd2a7f261e9f97661deaafd`

## FinalNotes Target

https://www.finalnotes.page/obituary-research-guide/

## Change

Added an obituary workflow note to `reference/source-hierarchy.md`, linking the FinalNotes Obituary Research Guide as a structured workflow for extracting names, dates, relationships, service details, and follow-up searches from obituaries before validating against Tier 1 records.

## Fit Rationale

`mattprusak/autoresearch-genealogy` is an active AI-assisted genealogy research kit with source-rigor guidance. Its source hierarchy already identifies newspaper obituaries as secondary sources and warns that they can contain errors. The FinalNotes guide fits as an obituary-specific workflow for using those secondary sources carefully.

## Verification

- `scripts/validate-repo` passed in the external checkout.
- `git diff --check` passed in the external checkout.
- `https://www.finalnotes.page/obituary-research-guide/` returned `HTTP/2 200`.
- `https://github.com/mattprusak/autoresearch-genealogy/pull/12` returned `HTTP/2 200`.
- PR metadata confirmed open, non-draft, mergeable, unmerged, one changed file, and two insertions.

## Completion Caveat

This is a proposed public backlink path only. It becomes an accepted/live backlink only if the maintainer merges the PR and the resulting GitHub page is indexed.
