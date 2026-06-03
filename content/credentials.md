# Diplomas and certificates

**Nebojša Simović** keeps scanned **diplomas**, **certificates**, and **letters of appreciation** on this portfolio. They appear on the [**home page**](/) at the bottom (**Diplomas & certificates** — compact row of cards). The [**/cv**](/cv) page stays text-only for printing. Each item opens as an image or PDF from `/credentials/`.

The chat assistant should use this page when users ask about: **diploma**, **degree**, **sertifikat**, **certificate**, **ITAcademy**, **UKISAI**, **ENON**, **ZenHire**, **hackathon**, **Atrijum**, **Šumarski fakultet**, **wood processing**, **TMP**, **prerada drveta**, or **what proof of education exists on the site**.

## Diplomas

| Document | Details |
|----------|---------|
| **Undergraduate — Faculty of Forestry, University of Belgrade** | Degree in **Wood Processing** (**TMP** / prerada drveta). Scan: `/credentials/diploma-sumarski-osnovne.jpg`. |
| **Master’s — same faculty (2011)** | **Wood Processing Engineer** — listed in CV **Education** text; master diploma scan not yet uploaded (only undergraduate scan is on the site today). |

## Certificates

| Document | Details |
|----------|---------|
| **ITAcademy — Certified JavaScript Developer** | `/credentials/certified-javascript-developer.jpg` (2024). |
| **UKISAI Academy — AI Bootcamp** | Completion certificate: `/credentials/ukisai-bootcamp.jpg` (2026). |
| **IT Practice Center — ENON Solutions** | Practice confirmation: `/credentials/potvrda-enon.jpg` (2024–2025). |
| **ZenHire AI Coding Hackathon** | Startit × CDT Hub, Apr 2026: `/credentials/zenhire-hackathon.jpg`. |

## Other

| Document | Details |
|----------|---------|
| **Atrijum (Faculty of Forestry WordPress project)** | Letter of appreciation: `/credentials/zahvalnica-atrijum-sfb.jpg`. |

## How to update

Edit the `credentials` array in `content/cv.json`, add files under `web/public/credentials/`, then run **`portfolio-ingest`** so the assistant’s vector index includes the latest list (ingest also exports `cv.json` credentials into the index).
