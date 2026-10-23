#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"
CONTEXT="${NETLIFY_CONTEXT:-production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy .env.example to .env.local and fill it in first." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if command -v netlify >/dev/null 2>&1; then
  CLI=(netlify)
else
  CLI=(npx --yes netlify-cli@latest)
fi

portal_keys=(PORTAL_EMAIL PORTAL_PASSWORD SESSION_SECRET)
publish_keys=(GITHUB_TOKEN GITHUB_REPO GITHUB_BRANCH NETLIFY_BUILD_HOOK)

set_key() {
  local key="$1" value="${!1:-}"
  if [[ -z "$value" ]]; then
    echo "Skipping $key (empty in .env.local)"
    return
  fi
  echo "Setting $key for context: $CONTEXT"
  "${CLI[@]}" env:set "$key" "$value" --context "$CONTEXT"
}

for key in "${portal_keys[@]}"; do set_key "$key"; done

for key in "${publish_keys[@]}"; do set_key "$key"; done

echo
echo "Netlify environment updated for '$CONTEXT'."
echo "Trigger a redeploy (Deploys > Trigger deploy) so the functions pick up the new values."
