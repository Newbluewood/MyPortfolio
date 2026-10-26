#!/bin/sh
set -e
CH="${CHROMA_PATH:-/data/chroma}"
MARKER="$CH/.portfolio_ingested"
mkdir -p "$CH"

# Re-ingest when the marker is missing OR the live collection is empty
# (failed swap, wiped volume, ingest interrupted after creating an empty collection).
needs_ingest=1
if [ -f "$MARKER" ]; then
  if python -c "
import os, sys
try:
    import chromadb
    from chromadb.errors import NotFoundError
except Exception:
    sys.exit(1)
path = os.environ.get('CHROMA_PATH', '/data/chroma')
name = os.environ.get('CHROMA_COLLECTION', 'portfolio_kb')
try:
    col = chromadb.PersistentClient(path=path).get_collection(name)
    sys.exit(0 if col.count() > 0 else 1)
except NotFoundError:
    sys.exit(1)
except Exception:
    sys.exit(1)
"; then
    needs_ingest=0
  fi
fi

if [ "$needs_ingest" = "1" ]; then
  echo "RAG index missing or empty: portfolio-ingest in background; API starts immediately for /health."
  (cd /app/api && portfolio-ingest && touch "$MARKER") &
fi
cd /app/api
exec uvicorn portfolio_api.main:app --host 0.0.0.0 --port "${PORT:-8000}"
