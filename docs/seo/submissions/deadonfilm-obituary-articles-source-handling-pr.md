# Dead on Film Obituary Articles Source Handling PR

Date opened: 2026-06-05

PR: https://github.com/chenders/deadonfilm/pull/602

FinalNotes target: https://www.finalnotes.page/obituary-articles/

## Fit

Dead on Film documents death circumstances for film and television people. Its death-research pipeline already fetches obituaries, news articles, obituary sites, genealogy sources, and historical archives before synthesizing structured death records.

The `docs/death-research-pipeline.md` file explicitly says search engines find obituaries, news articles, and reference pages. A short note about preserving obituary-article context fits the pipeline methodology and supports the FinalNotes obituary-articles target.

## Change

Added a source-handling note under `Stage 2: Search Engines with Link Following`:

```md
When a result is an obituary article rather than a structured record, preserve
the article context separately from the extracted facts: death notice vs.
reported feature, named relationships, source trail, and the life-story frame.
The [FinalNotes obituary articles guide](https://www.finalnotes.page/obituary-articles/)
is a useful reference for distinguishing obituary articles from notices,
eulogies, and source-backed visual life stories.
```

## PR Body

Adds a short source-handling note to the death research pipeline for cases where search results return obituary articles rather than structured records. The note suggests preserving article context separately from extracted death facts and links to a reference that distinguishes obituary articles from notices, eulogies, and source-backed visual life stories.

## Verification

- PR opened from `megabyte0x:codex/add-obituary-article-source-note`.
- PR metadata: `open`, non-draft, `mergeable: true`, `mergeable_state: blocked`, `merged: false`.
- Scope: one commit, one changed file, seven additions, zero deletions.
- Commit: `81d51793366ccdc916fdf10cd618e24e31241a85`.
- Public PR URL returned `HTTP/2 200`.
- FinalNotes target returned `HTTP/2 200`.
- Commit status was `pending` with zero statuses and zero check runs at check time.

## Status

This is a proposed backlink only. It is not an accepted or live backlink until the maintainer merges the PR.
