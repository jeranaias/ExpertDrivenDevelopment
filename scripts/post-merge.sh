#!/bin/bash
# Post-merge setup for the EDD static-site repo.
#
# Idempotent: safe to run on every merge. Stdin is closed by the
# platform, so all commands must be non-interactive.
set -e

if [ -f package.json ]; then
  npm install --no-audit --no-fund
fi

if [ -f pyproject.toml ] && command -v uv >/dev/null 2>&1; then
  uv sync --frozen
fi
