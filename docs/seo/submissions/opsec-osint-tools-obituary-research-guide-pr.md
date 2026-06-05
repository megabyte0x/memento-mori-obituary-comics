# OPSEC OSINT Tools Obituary Research Guide PR

Status: ready-for-review PR opened; not merged or accepted yet
Target repository: https://github.com/airborne-commando/OPSEC-OSINT-Tools
Pull request: https://github.com/airborne-commando/OPSEC-OSINT-Tools/pull/196
Fork branch: `megabyte0x:codex/add-finalnotes-obituary-research-guide`
Commit: `e28e1ce48b39da6b3d157d35652c469725e051ec`
FinalNotes URL: https://www.finalnotes.page/obituary-research-guide/

## Why This Qualifies

`airborne-commando/OPSEC-OSINT-Tools` is an active public OSINT/OPSEC guide with 89 stars at the time of review. Its README includes a `Genealogy & Records` table that already lists genealogyintime and Find A Grave, and the guide describes genealogical OSINT as including death records, obituaries, gravestone databases, and burial registries.

The FinalNotes obituary research guide fits as a research-workflow companion because it helps people find obituary records, preserve source trails, and use obituary clues in sourced family-history research.

## README Addition

```markdown
| FinalNotes Obituary Research Guide | Obituary records and death notices | Source trail and family-history clues | Research guide; not a records database | [Link](https://www.finalnotes.page/obituary-research-guide/) |
```

## Verification

- GitHub PR metadata confirmed PR `#196` is open, ready for review, and mergeable.
- The PR page returned `HTTP/2 200`.
- Local `git diff --cached` confirmed the PR contains one README insertion.
- `https://www.finalnotes.page/obituary-research-guide/` returned `HTTP/2 200`.
- `git diff --check` passed in the temporary external clone.
- No repository test runner was present for this README-only resource-list change.

## Follow-Up

- Do not count this as an accepted backlink until the PR is reviewed and merged.
- If merged, record the live README URL in `docs/seo/backlink-outreach-tracker.md` with the anchor `FinalNotes Obituary Research Guide`.
- If rejected, record the reason and do not reopen unless the maintainer asks for a revised description.
