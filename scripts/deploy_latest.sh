#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: scripts/deploy_latest.sh /comics/<slug>/ [commit-message]" >&2
  exit 2
fi

comic_path="$1"
commit_message="${2:-publish comic ${comic_path}}"
slug="${comic_path#/comics/}"
slug="${slug%/}"
site_url="${FINALNOTES_SITE_URL:-https://www.finalnotes.page}"
site_url="${site_url%/}"

if [ -z "$slug" ] || [ "$slug" = "$comic_path" ] || [[ "$slug" == *"/"* ]]; then
  echo "comic path must look like /comics/<slug>/" >&2
  exit 2
fi

if [ ! -d "comics/$slug" ]; then
  echo "comic directory not found: comics/$slug" >&2
  exit 2
fi

# New comic binaries are intentionally gitignored. Upload them through the live
# finalnotes.page app so the Worker verifies the signature and writes the
# stable object key into the private Cloudflare R2 bucket.
pnpm run r2:upload-live:dry-run -- --slug "$slug" --require-assets --base-url "$site_url"
pnpm run r2:upload-live -- --slug "$slug" --require-assets --base-url "$site_url"
pnpm run r2:verify-live -- --slug "$slug" --base-url "$site_url"

python scripts/add_comic.py --render-only
pnpm test
pnpm build

if ! git diff --quiet || [ -n "$(git status --porcelain)" ]; then
  git add app components lib scripts README.md next.config.mjs open-next.config.ts wrangler.jsonc image-loader.js \
    public/_headers .github .gitignore tests docs package.json pnpm-lock.yaml pnpm-workspace.yaml comics.json comics
  git commit -m "$commit_message"
  git push origin main
fi

# Cloudflare is the production runtime. Set the opt-out only when a separate
# Workers Build pipeline will deploy the pushed commit.
if [ "${FINALNOTES_SKIP_CLOUDFLARE_DEPLOY:-0}" = "1" ]; then
  echo "Skipping local Cloudflare deploy; waiting for the configured Workers Build"
else
  pnpm deploy
fi

page_url="${site_url}${comic_path}"
for attempt in $(seq 1 60); do
  status="$(curl -L -s -o /tmp/finalnotes-latest-page.html -w '%{http_code} %{content_type}' "$page_url" || true)"
  case "$status" in
    200\ text/html*)
      printf '%s\n' "$page_url"
      exit 0
      ;;
  esac
  echo "waiting for $page_url ($attempt/60): $status" >&2
  sleep 10
done

echo "production page did not become ready: $page_url" >&2
exit 1
