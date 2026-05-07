# syntax=docker/dockerfile:1
# Build from repository root:
#   docker build -f api/Dockerfile -t portfolio-api .
#
# Runtime expects env: GOOGLE_API_KEY (or GEMINI_API_KEY), GITHUB_USERNAME, CORS_ORIGINS,
# optional GITHUB_TOKEN, PORT (many PaaS set this automatically).

FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    CHROMA_PATH=/data/chroma

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY api ./api
COPY content ./content

WORKDIR /app/api
RUN pip install --no-cache-dir -e .

COPY api/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/docker-entrypoint.sh"]
