# Open-Genealogy PR: Obituary Source Handling Reference

Status: ready-for-review PR opened 2026-06-05

PR: https://github.com/DigitalArchivst/Open-Genealogy/pull/6

FinalNotes target: https://www.finalnotes.page/obituary-research-guide/

External branch: `megabyte0x:codex/add-obituary-source-reference`

Commit: `bdd0cec912a46ad85c22bb83119ef024133025ed`

## Target Fit

`DigitalArchivst/Open-Genealogy` is an active GPS-aligned genealogy prompt and
agent-skill toolkit. The repository already has a `research/reference/` area for
evidence terminology, making an applied obituary source handling reference a
natural addition.

The PR adds `research/reference/obituary-source-handling.md`, which explains how
to classify obituary facts under the Evidence Analysis Process Map, how to
extract obituary facts before writing a family-history narrative, and when to
preserve uncertainty or conflicts.

The FinalNotes link is included as a related external resource:

> The FinalNotes Obituary Research Guide is a practical companion for collecting
> obituary records and turning them into sourced life-story notes before using
> the narrative-writing prompts in this repository.

## Verification

- GitHub API confirmed the PR is open, non-draft, mergeable, unmerged, and has
  zero comments and zero review comments.
- PR page returned `HTTP/2 200`.
- FinalNotes target returned `HTTP/2 200`.
- External branch is clean after push.
- `git diff --cached --check` passed before commit.

## Ranking Status

This is proposed public backlink progress only. It is not an accepted or live
backlink until the Open-Genealogy maintainer accepts and merges the PR.
