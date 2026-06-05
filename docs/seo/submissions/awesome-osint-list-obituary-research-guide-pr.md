# Awesome OSINT List Obituary Research Guide PR

Status: ready-for-review PR opened; not merged or accepted yet
Target repository: https://github.com/Astrosp/Awesome-OSINT-List
Pull request: https://github.com/Astrosp/Awesome-OSINT-List/pull/131
Fork branch: `megabyte0x:codex/add-finalnotes-obituary-research-guide`
Commit: `1f74850c344c04eb717a1bd660717afd0d3244a0`
FinalNotes URL: https://www.finalnotes.page/obituary-research-guide/

## Why This Qualifies

`Astrosp/Awesome-OSINT-List` is an active public OSINT resource list with 3,387 stars at the time of review. Its `PUBLIC RECORDS` section already includes cemetery, death-index, obituary, and genealogy resources, so an obituary research guide fits the existing editorial taxonomy.

The FinalNotes obituary research guide fits as a practical research companion because it helps people find obituary records, preserve source trails, and use obituary clues in sourced family-history research.

## README Addition

```markdown
- [FinalNotes Obituary Research Guide](https://www.finalnotes.page/obituary-research-guide/) - Guide for finding obituary records, preserving source trails, and using obituary clues in sourced family-history research.
```

## Verification

- GitHub PR metadata confirmed PR `#131` is open, ready for review, and mergeable.
- The PR page returned `HTTP/2 200`.
- Local `git diff --cached` confirmed the PR contains one README insertion.
- `https://www.finalnotes.page/obituary-research-guide/` returned `HTTP/2 200`.
- `git -c core.whitespace=cr-at-eol diff --check` passed in the temporary external clone because this repository stores `README.md` as CRLF under `text=auto`.
- `npm test` was attempted after `npm install --no-package-lock`, but the repository currently reports many pre-existing README-wide markdownlint failures.
- `npm run link-check` was attempted in sandbox and escalated modes; the sandbox run reported many status-0 checks including existing links and the escalated run hung, so the direct FinalNotes HTTP check is the targeted new-link verification.

## Follow-Up

- Do not count this as an accepted backlink until the PR is reviewed and merged.
- If merged, record the live README URL in `docs/seo/backlink-outreach-tracker.md` with the anchor `FinalNotes Obituary Research Guide`.
- If rejected, record the reason and do not reopen unless the maintainer asks for a revised description.
