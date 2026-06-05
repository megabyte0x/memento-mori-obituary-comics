# OSINT Framework Obituary Research Guide PR

Status: ready-for-review PR opened; not merged or accepted yet
Target repository: https://github.com/lockfale/OSINT-Framework
Pull request: https://github.com/lockfale/OSINT-Framework/pull/706
Fork branch: `megabyte0x:codex/add-finalnotes-obituary-research-guide`
Commit: `dcf26d5207dcd18719371d0b2471c8a3d044cfe0`
FinalNotes URL: https://www.finalnotes.page/obituary-research-guide/

## Why This Qualifies

`lockfale/OSINT-Framework` is a high-visibility public OSINT resource project. It has a `Public Records > Death Records` category that already includes death indexes, Find A Grave, and BillionGraves.

The FinalNotes obituary research guide fits this category as a practical obituary-record workflow. It helps researchers find obituary records, preserve source trails, and use obituary clues in sourced family-history research.

## JSON Addition

```json
{
  "name": "FinalNotes Obituary Research Guide",
  "type": "url",
  "url": "https://www.finalnotes.page/obituary-research-guide/",
  "description": "Guide for finding obituary records, preserving source trails, and using obituary clues in sourced family-history research.",
  "status": "live",
  "pricing": "free",
  "bestFor": "Obituary research workflow and source-trail preservation",
  "input": "Name, location, date range, family details",
  "output": "Research steps, source trail checklist, obituary clues, family-history story prompts",
  "opsec": "passive",
  "opsecNote": "Public guide; no search query or account required.",
  "localInstall": false,
  "googleDork": false,
  "registration": false,
  "editUrl": false,
  "api": false,
  "invitationOnly": false,
  "deprecated": false
}
```

## Verification

- GitHub PR metadata confirmed PR `#706` is open, ready for review, and mergeable.
- The PR page returned `HTTP/2 200`.
- Local `git show` confirms `public/arf.json` adds one FinalNotes obituary research guide entry.
- `public/arf.json` parsed successfully with Node.js.
- `https://www.finalnotes.page/obituary-research-guide/` returned `HTTP/2 200`.
- `git diff --check` passed in the temporary external clone.

## Follow-Up

- Do not count this as an accepted backlink until the PR is reviewed and merged.
- If merged, record the live OSINT Framework URL in `docs/seo/backlink-outreach-tracker.md` with the anchor `FinalNotes Obituary Research Guide`.
- If rejected, record the reason and do not reopen unless the maintainer asks for a revised description.
