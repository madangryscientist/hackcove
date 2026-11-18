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
  echo "dist/index.html is missing; run 'bunx moon run hack-cove-site:build' first" >&2
  exit 1
fi

# Only a dist/ built from the clean HEAD goes out, so the build-commit meta on the live site names the
# commit that was deployed. Build it with --force, since a cached -dirty dist/ keys on the same hash:
#   BUILD_COMMIT=$(git rev-parse HEAD) bunx moon run hack-cove-site:build --force
if [[ -n "$(git status --porcelain)" ]]; then
  echo "the working tree is dirty; commit or drop the changes, rebuild, then deploy" >&2
  exit 3
fi
HEAD_SHA="$(git rev-parse HEAD)"
BUILT_SHA="$(sed -n 's/.*<meta name="build-commit" content="\([^"]*\)".*/\1/p' dist/index.html | head -n 1)"
if [[ "$BUILT_SHA" != "$HEAD_SHA" ]]; then
  echo "dist/ was built from '${BUILT_SHA:-no build-commit meta}', not HEAD $HEAD_SHA; rebuild with BUILD_COMMIT=\$(git rev-parse HEAD) bunx moon run hack-cove-site:build --force" >&2
  exit 3
fi

secret() {
  local value
  if ! value="$(ob secret get "$1" 2>/dev/null)" || [[ -z "$value" ]]; then
    echo "missing secret '$1'. Add it with: ob secret set $1" >&2
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
