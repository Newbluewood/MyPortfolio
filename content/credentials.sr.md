# Diplome i sertifikati

**Nebojša Simović** na portfoliju drži skenove **diploma**, **sertifikata** i **zahvalnica**. Prikazani su na [**početnoj**](/) pri dnu (**Diplome i sertifikati** — niz malih kartica). Stranica [**/cv**](/cv) ostaje samo tekst za štampu. Svaka stavka se otvara kao slika ili PDF sa putanje `/credentials/`.

Asistent treba da koristi ovu stranicu kad korisnik pita o: **diplomi**, **diplome**, **sertifikatu**, **ITAcademy**, **UKISAI**, **ENON**, **ZenHire**, **hakatonu**, **Atrijumu**, **PDP**, **programu ličnog razvoja**, **LINK group**, **Šumarskom fakultetu**, **preradi drveta**, **TMP**, ili **dokazima obrazovanja na sajtu**.

## Diplome

| Dokument | Detalji |
|----------|---------|
| **Osnovne studije — Šumarski fakultet, Univerzitet u Beogradu** | Smer **Prerada drveta (TMP)**. Sken: `/credentials/diploma-sumarski-osnovne.jpg`. |
| **Master studije — isti fakultet (2011)** | **Inženjer prerade drveta** — u CV sekciji Obrazovanje; sken master diplome još nije postavljen (na sajtu je trenutno sken osnovnih studija). |

## Sertifikati

| Dokument | Detalji |
|----------|---------|
| **ITAcademy — Certified JavaScript Developer** | `/credentials/certified-javascript-developer.jpg` (2024). |
| **LINK group — Program ličnog razvoja (PDP)** | `/credentials/pdp-link-group.jpg` (okt 2024). |
| **ITAcademy — AI & Python Development (pohađanje)** | Jednogodišnji program: `/credentials/ita-ai-python-attendance.jpg` (jun 2026). |
| **ITAcademy — Certified Python Data Analyst** | `/credentials/ita-certified-python-data-analyst.jpg` (jun 2026). |
| **UKISAI Academy — AI Bootcamp** | Sertifikat: `/credentials/ukisai-bootcamp.jpg` (2026). |
| **IT Practice Center — ENON Solutions** | Potvrda o praksi: `/credentials/potvrda-enon.jpg` (2024–2025). |
| **ZenHire AI Coding Hackathon** | Startit × CDT Hub, apr 2026: `/credentials/zenhire-hackathon.jpg`. |

## Ostalo

| Dokument | Detalji |
|----------|---------|
| **Atrijum (WordPress projekat za Šumarski fakultet)** | Zahvalnica: `/credentials/zahvalnica-atrijum-sfb.jpg`. |

## Ažuriranje

Izmeni niz `credentials` u `content/cv.json`, dodaj fajlove u `web/public/credentials/`, pa pokreni **`portfolio-ingest`** da asistent u indeksu ima najnoviju listu (ingest takođe izvozi stavke iz `cv.json` u RAG).
