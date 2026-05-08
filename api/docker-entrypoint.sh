#!/bin/sh
set -e
CH="${CHROMA_PATH:-/data/chroma}"
MARKER="$CH/.portfolio_ingested"
mkdir -p "$CH"
if [ ! -f "$MARKER" ]; then
  echo "First boot: portfolio-ingest in background (RAG); API starts immediately for /health."
  (cd /app/api && portfolio-ingest && touch "$MARKER") &
fi
cd /app/api
exec uvicorn portfolio_api.main:app --host 0.0.0.0 --port "${PORT:-8000}"
