#!/usr/bin/env bash
# One-time prep: seeds ./config and installs the Resideo custom integration.
# Safe to re-run (upgrades the integration, never overwrites configuration.yaml).
set -euo pipefail
cd "$(dirname "$0")"

VERSION="${RESIDEO_VERSION:-v0.3.3}"
mkdir -p config/custom_components
[ -f config/configuration.yaml ] || cp configuration.yaml config/configuration.yaml

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
curl -fsSL "https://github.com/sfcodes/ha-resideo/archive/refs/tags/${VERSION}.tar.gz" -o "$tmp/r.tgz"
tar -xzf "$tmp/r.tgz" -C "$tmp"
rm -rf config/custom_components/resideo
cp -R "$tmp"/ha-resideo-*/custom_components/resideo config/custom_components/resideo

echo "Installed ha-resideo ${VERSION}. Next: docker compose up -d  (then restart it if it was already running)"
