#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: scripts/deploy_latest.sh /comics/<slug>/" >&2
  exit 2
fi

comic_path="$1"
slug="${comic_path#/comics/}"
slug="${slug%/}"
site_url="${FINALNOTES_SITE_URL:-https://www.finalnotes.page}"
site_url="${site_url%/}"

if [ -z "$slug" ] || [ "$slug" = "$comic_path" ] || [[ "$slug" == *"/"* ]]; then
  echo "comic path must look like /comics/<slug>/" >&2
  exit 2
fi

pnpm comic:publish -- --slug "$slug" --base-url "$site_url"
