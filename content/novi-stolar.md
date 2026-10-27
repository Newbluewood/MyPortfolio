# Novi Stolar — kitchen cabinet configurator

This file is for the on-site assistant. **Novi Stolar** (GitHub: `Novi-Stolar-v1`, also written Novi Stolar v1) is Nebojša Simović’s **smart kitchen-cabinet configurator**. It connects his **Master’s in Wood Processing** (Faculty of Forestry, University of Belgrade, 2011) with software: real joinery math (cutting lists, edgebanding, hardware, L-layouts), not a generic furniture mockup.

## Live demos (public)

The GitHub repo is **private**. **There is a live site** — do not say there is none just because GitHub About → Website is empty. The running app is public on Render:

- **Workshop (one cabinet template → cutting list + 3D):** https://novi-stolar-v1.onrender.com
- **Planner (full kitchen in a room, same engine):** https://novi-stolar-v1.onrender.com/planner
- **GitHub (private):** https://github.com/Newbluewood/Novi-Stolar-v1

Render may cold-start: first open can take a short wait.

## What it does

Built for a **small joinery workshop**, not IKEA-style retail planning.

**Workshop (`/`):** the joiner defines **one cabinet template** — dimensions, part formulas, edgebanding (kant), hardware, 3D preview — then saves it into the catalog.

**Planner (`/planner`):** the joiner places **instances** of those templates on a wall:

- Room geometry (form or sketch upload)
- **Straight run** or **L-kitchen** (including true corner cabinets)
- Project cutting list, materials, worktop order plan, cost estimate (predračun)
- 3D mesh (Three.js), JPEG/PDF snapshot of the 3D view
- Excel/PDF export of cutting lists
- Layout warnings (openings, masks, crown, worktop joints)

## Domain features (joinery, not just UI)

- **Cutting lists in final (gross) sizes including edgebanding**; kant is an attribute of each board.
- Catalog of **11 golden cabinet types** (standard base, drawers, oven, sink, tall fridge/oven, wall units, Aventos HF lift, extractor) plus corner units, dishwasher, fridge-gap fillers, worktop/plinth masks.
- **L-kitchen:** blind corners and true L-corpses with their own cutting geometry; worktop/plinth/masks follow the walls.
- **Materials:** carcass / front / back / worktop; per-instance décor override; Pinoles worktop boards with an order plan (how many slabs, joints over 4100 mm).
- **Hardware math:** drawers (Blum Tandembox and similar), hinges, Aventos HF per Blum docs, drilling schemes for the golden templates.
- **Gemini Vision:** optional sketch → room JSON (`GEMINI_API_KEY`); the joiner can correct the result on screen.
- **Obstacle × board intersection** (pipes, windows vs carcass parts) for CAD overlay / drilling notes.

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | Vanilla HTML/CSS/JS (ES modules), two UIs on purpose: workshop vs planner |
| 3D | Three.js 0.128 |
| Geometry engine | JavaScript (`preracunajDelove` / AST formula parser) — no React rewrite |
| Server | Python 3 `http.server` (threading), port 9000 locally; Render uses `$PORT` |
| Data | JSON catalogs (materials, hardware, drilling rules, nomenclature) |
| AI | Google Gemini for room-sketch vision |
| Hosting | Render: https://novi-stolar-v1.onrender.com |
| Tests | `npm test` in `Novi_Stolar_v1/` (geometry, layout, golden templates) |

Architecture is three strict layers: **data → math → UI**. The planner and workshop share the same math layer.

## Status (as of August 2026)

**Usable product for a straight wall and an L-kitchen** — from room to cutting list, 3D, and a materials/hardware estimate. Last product work mid-August 2026 (dishwasher, fridge-gap UI, mask orientation, 3D export, notes on room markers).

**Not in v1 yet (honest backlog):** full **U-kitchen / island** packing (only a warning today), quote PDF/Excel export, real nesting optimization, priced hardware/board catalogs beyond worktops, merging workshop + planner into one UI.

## v1 vs v2

- **v1 (`Novi_Stolar_v1/`)** — the **live product** (workshop + planner + Render). This is what visitors should open.
- **v2 (`Novi_Stolar_v2/Konstruktor_korpusa/`)** — a **TypeScript carcass engine** (recursive shell + fill strategies, family/priority rules, `KorpusAPI`). Lab UI, not deployed. Intended so later planners (kitchen, wardrobe, bathroom) share one cutting/fill law.

When asked “what is Novi Stolar?”, answer **v1 the kitchen configurator** and give the Render URLs. Mention v2 only if asked about the next engine or TypeScript rewrite.

## How to talk about this in chat

Typical questions: “Novi Stolar”, “kitchen planner”, “krojna lista”, “cabinet configurator”, “Three.js kitchen”, “woodworking app”, “L kuhinja”, “kantovanje”, “predračun”, “Render demo”.

Lead with **what it is + live URLs**, then stack or domain depth if asked. Do not dump internal file names. Do not claim the GitHub repo is public.
