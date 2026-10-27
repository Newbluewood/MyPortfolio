# Novi Stolar — konfigurator kuhinjskih korpusa

Ovaj fajl je za asistenta na sajtu. **Novi Stolar** (GitHub: `Novi-Stolar-v1`, i Novi Stolar v1) je **pametni konfigurator kuhinjskih korpusa** Nebojše Simovića. Povezuje **master diplomu iz prerade drveta** (Šumarski fakultet, Univerzitet u Beogradu, 2011) sa softverom: prava stolarska matematika (krojna lista, kant, okov, L-raspored), ne generički „nameštaj u 3D“.

## Live demo (javno)

GitHub repo je **privatan**. **Live sajt postoji** — nemoj reći da ga nema samo zato što je GitHub About → Website prazan. Radića aplikacija je javna na Renderu:

- **Radionica (jedan šablon → krojna lista + 3D):** https://novi-stolar-v1.onrender.com
- **Planner (cela kuhinja u prostoru, isti motor):** https://novi-stolar-v1.onrender.com/planner
- **GitHub (privatan):** https://github.com/Newbluewood/Novi-Stolar-v1

Render može da se budi iz cold start-a: prvo otvaranje ponekad sačeka.

## Šta radi

Namenjen **maloj stolarskoj radionici**, ne IKEA-planneru za maloprodaju.

**Radionica (`/`):** stolar definiše **jedan šablon korpusa** — dimenzije, formule delova, kant, okov, 3D pregled — pa ga peče u katalog.

**Planner (`/planner`):** stolar slaže **instance** tih šablona na zid:

- Prostor (formular ili upload skice)
- **Niz** ili **L-kuhinja** (uključujući prave ugaone korpuse)
- Krojna lista projekta, materijali, plan poručivanja radne ploče, predračun
- 3D mesh (Three.js), snimak 3D prikaza kao JPEG/PDF
- Excel/PDF izvoz krojne
- Upozorenja layouta (otvori, maske, kruna, spojevi ploče)

## Stolarski domen (nije samo UI)

- **Krojne liste su finalne (bruto) mere sa kantom**; kantovanje je atribut daske.
- Katalog **11 golden šablona** (standardni donji, fioke, rerna, sudopera, visoki stub frižider/rerna, gornji, Aventos HF, aspirator) plus ugaoni, sudomašina, SEL ispune uz frižider, maske ploče/sokle.
- **L-kuhinja:** slepi uglovi i pravi L-korpusi sa sopstvenom krojnom; ploča/sokla/maske prate zidove.
- **Materijali:** korpus / front / leđa / radna ploča; override dezena po instanci; Pinoles table sa planom poručivanja (broj tabli, spoj preko 4100 mm).
- **Okov:** fioke (Blum Tandembox i slični), šarke, Aventos HF po Blum dokumentaciji, šeme bušenja za golden šablone.
- **Gemini Vision:** opciono skica prostorije → JSON prostora (`GEMINI_API_KEY`); stolar može da ispravi rezultat na ekranu.
- **Presek prepreka × daske** (cevi, prozori vs delovi korpusa) za CAD overlay / napomene bušenja.

## Tech stack

| Sloj | Izbor |
|------|--------|
| UI | Vanilla HTML/CSS/JS (ES moduli), namerno dva UI: radionica i planner |
| 3D | Three.js 0.128 |
| Geometrijski motor | JavaScript (`preracunajDelove` / AST parser formula) — bez React rewrite-a |
| Server | Python 3 `http.server` (threading), lokalno port 9000; na Renderu `$PORT` |
| Podaci | JSON katalozi (materijali, okov, pravila bušenja, nomenklatura) |
| AI | Google Gemini za vision skice prostora |
| Hosting | Render: https://novi-stolar-v1.onrender.com |
| Testovi | `npm test` u `Novi_Stolar_v1/` (geometrija, layout, golden šabloni) |

Arhitektura je stroga: **podaci → matematika → interfejs**. Planner i radionica dele isti matematički sloj.

## Status (avgust 2026.)

**Upotrebljiv proizvod za niz i L-kuhinju** — od prostora do krojne, 3D i predračuna materijala/okova. Poslednji proizvodni rad sredina avgusta 2026. (sudomašina, SEL UI, orijentacija maski, izvoz 3D, napomene na prostornim oznakama).

**Još nije u v1 (iskren backlog):** pun motor za **U-kuhinju / ostrvo** (danas samo upozorenje), PDF/Excel izvoz predračuna, pravi nesting, cenovnici univera/kanta/okova pored radnih ploča, spajanje radionice i plannera u jedan UI.

## v1 naspram v2

- **v1 (`Novi_Stolar_v1/`)** — **živi proizvod** (radionica + planner + Render). To treba otvoriti posetiocima.
- **v2 (`Novi_Stolar_v2/Konstruktor_korpusa/`)** — **TypeScript motor korpusa** (rekurzivna ljuska + strategije punjenja, porodična pravila, `KorpusAPI`). Laboratorijski UI, nije deployovan. Cilj: da kasniji planeri (kuhinja, plakar, kupatilo) dele isti zakon krojenja i punjenja.

Na pitanje „šta je Novi Stolar?“ odgovori **v1 konfigurator kuhinje** i daj Render URL-ove. v2 pominji samo ako pitaju za sledeći motor ili TypeScript.

## Kako asistent da koristi ovo

Tipična pitanja: „Novi Stolar“, „planner kuhinje“, „krojna lista“, „konfigurator korpusa“, „Three.js kuhinja“, „stolarski softver“, „L kuhinja“, „kantovanje“, „predračun“, „Render demo“.

Prvo **šta je + live URL**, pa stack ili stolarski detalj ako pitaju. Ne dumpuj imena internih fajlova. Ne tvrdi da je GitHub javan.
