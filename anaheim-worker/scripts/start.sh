#!/bin/bash
set -e
set -o pipefail

echo "🚀 Starting Anaheim Worker..."

# Activate venv if exists
if [ -f "/work/.venv/bin/activate" ]; then
    echo "💡 Activating Python virtual environment..."
    source /work/.venv/bin/activate
fi

# Ensure data folders exist
mkdir -p /work/data/patches

# Display paths
echo "📂 REPO_PATH=$REPO_PATH"
echo "📂 GOV_PATH=$GOV_PATH"
echo "📂 DB_PATH=$DB_PATH"
echo "🧠 LLM_CMD=$LLM_CMD"

# Install Node deps if missing
if [ ! -d "$REPO_PATH/node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    cd "$REPO_PATH"
    pnpm install
fi

# Run full worker
echo "⚡ Running worker_full.py..."
cd /work/src
exec python worker_full.py
