# About

**NBW** (New Blue Wood) is how this portfolio is branded on the surface; behind it I'm **Nebojša Simović** (born **1978**, Serbia) — a developer focused on **modern frontends**, **practical full‑stack** work, and **AI‑assisted** workflows.

Beyond code: I'm **married with one child**, stay active with **CrossFit** (about three sessions per week), **OCR Tribalion**, and **weekend runs** with my daughter; my background includes **wood processing (Forestry faculty, Belgrade)**, **facility / operations management**, and hands-on **DIY**. The assistant can pull more detail from [`personal.md`](personal.md) in this repo.

This site pulls **live project metadata from GitHub**, adds optional **Netlify** hints when you configure a token, and hosts a **CV** at [`/cv`](/cv). The floating **assistant** is not a generic chatbot: it uses **retrieval‑augmented generation (RAG)** over curated Markdown under `content/` in this repo (including this file) plus ingested **README** snapshots, so answers stay grounded in what you’ve actually written.

**How to refresh what the assistant knows:** after editing `content/*.md`, run the ingest CLI (`portfolio-ingest`) as described in the **Setup** section of the repository’s main **README** (at the repo root). That updates the local Chroma index the API reads at query time.

If you’re skimming quickly: start at [**Projects**](/projects) for repos and deploy links, [**CV**](/cv) for a printable resume, and [**Contact**](/contact) to reach out.
