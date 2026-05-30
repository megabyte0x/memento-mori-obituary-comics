#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: scripts/deploy_latest.sh /comics/<slug>/ [commit-message]" >&2
  exit 2
fi

comic_path="$1"
commit_message="${2:-publish comic ${comic_path}}"

if ! git diff --quiet || [ -n "$(git status --porcelain)" ]; then
  git add index.html comics.json comics assets scripts README.md vercel.json .github .gitignore
  git commit -m "$commit_message"
  git push origin main
fi

# Production deploy from the committed tree. Vercel CLI prints the deployment URL.
pnpm dlx vercel deploy --prod --yes | tee /tmp/memento-mori-vercel-deploy.log
site_url=$(grep -Eo 'https://[^ ]+\.vercel\.app' /tmp/memento-mori-vercel-deploy.log | tail -1 | tr -d '\r')
if [ -z "$site_url" ]; then
  site_url="https://memento-mori-obituary-comics.vercel.app"
fi
printf '%s%s\n' "${site_url%/}" "$comic_path"
