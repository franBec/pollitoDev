#!/usr/bin/env bash
set -euo pipefail

# Keep the Netlify binary independent of the dashboard HUGO_VERSION value.
HUGO_VERSION="0.169.0"
HUGO_ARCHIVE="hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
HUGO_URL="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${HUGO_ARCHIVE}"

curl -fsSL "$HUGO_URL" -o /tmp/hugo.tar.gz
tar -xzf /tmp/hugo.tar.gz -C /tmp

export HUGO_ENV="production"
export HUGO_NUMWORKERMULTIPLIER="1"

/tmp/hugo --gc --minify --baseURL "${URL:-https://pollito.dev/}"
cp public/en/404.html public/404.html
