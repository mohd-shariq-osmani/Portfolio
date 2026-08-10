#!/usr/bin/env bash

# Set homebrew node path
export PATH="/opt/homebrew/bin:$PATH"

# Navigate to project directory
CDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CDIR"

echo "=========================================="
echo " 🚀 Launching Portfolio Site with ngrok "
echo "=========================================="

# Run ngrok server launcher
node scripts/start-with-ngrok.js
