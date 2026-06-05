# MBU Genealogy Merit Badge Obituary Research Guide PR

Date opened: 2026-06-05

PR: https://github.com/markgoho/mbu/pull/77

FinalNotes target: https://www.finalnotes.page/obituary-research-guide/

Live target page before merge: https://merit-badge.university/merit-badges/genealogy/guide/req4ab/

## Fit

The Merit Badge University Genealogy guide teaches scouts how physical and digital sources help with family-tree research. Requirement 4b already explains that digital newspaper archives often contain obituaries, wedding announcements, legal notices, and local stories.

The page already uses an external-link shortcode for FamilySearch. A second resource for obituary extraction fits the existing page structure and supports the lesson's focus on comparing and citing genealogy sources.

## Change

Added one external-link shortcode to `hugo/content/merit-badges/genealogy/guide/req4ab.md`:

```md
{{< drg/external-link
    title="FinalNotes — Obituary Research Guide"
    url="https://www.finalnotes.page/obituary-research-guide/"
    description="A practical checklist for extracting names, relationships, places, and service details from obituary records." >}}
```

## PR Body

Adds one external resource to the Genealogy merit badge guide for Requirement 4a-4b. The page already explains that digital newspaper archives often contain obituaries; this adds a practical checklist students can use to extract names, relationships, places, and service details from obituary records before citing and comparing the source.

## Verification

- PR opened from `megabyte0x:codex/add-obituary-research-guide-resource`.
- PR metadata: `open`, non-draft, `mergeable: true`, `mergeable_state: unstable`, `merged: false`.
- Scope: one commit, one changed file, five additions, zero deletions.
- Commit: `5c34920fa9450664e4d284b2cf56f31c0291d189`.
- Public PR URL returned `HTTP/2 200`.
- Live guide page returned `HTTP/2 200` before merge.
- FinalNotes target returned `HTTP/2 200`.
- Commit status was `pending` with zero statuses and zero check runs at check time.

## Status

This is a proposed backlink only. It is not an accepted or live backlink until the maintainer merges the PR and the site deploys.
