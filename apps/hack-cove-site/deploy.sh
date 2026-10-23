#!/usr/bin/env bash
# Deploy the built site to Cloudflare Pages by DIRECT UPLOAD.
#
# Direct upload only: the Pages git integration is deliberately not used. wrangler uploads
# dist/ and never sees the repo.
#
# Preview is the default. Production requires --production, spelled out, because
# hack-cove.com is a live company domain. This script only ever uploads static assets.
set -euo pipefail

PROJECT="${HACK_COVE_PAGES_PROJECT:-hack-cove-site}"
BRANCH="preview"

for arg in "$@"; do
  case "$arg" in
    --production) BRANCH="main" ;;
    --branch=*) BRANCH="${arg#--branch=}" ;;
    *)
      echo "usage: ./deploy.sh [--production | --branch=<name>]" >&2
      exit 2
      ;;
  esac
done

if [[ ! -f dist/index.html ]]; then
  echo "dist/index.html is missing — run 'bunx nx build hack-cove-site' first" >&2
  exit 1
fi

secret() {
  local value
  if ! value="$(ob secret get "$1" 2>/dev/null)" || [[ -z "$value" ]]; then
    echo "missing secret '$1' — add it with: ob secret set $1" >&2
    exit 1
  fi
  printf '%s' "$value"
}

CLOUDFLARE_API_TOKEN="$(secret cloudflare-api-token)"
CLOUDFLARE_ACCOUNT_ID="$(secret cloudflare-account-id)"
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID

echo "uploading dist/ to Pages project '$PROJECT' on branch '$BRANCH'"
exec bunx wrangler pages deploy dist \
  --project-name="$PROJECT" \
  --branch="$BRANCH" \
  --commit-dirty=true
